'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Agrupa pinos próximos (o mapeamento põe ~450 lojas só em Maringá).
// Precisa vir depois do leaflet: o plugin se pendura no `L` global.
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { soLocalizacaoNoMapa } from '@/lib/partnerPublico';

interface Servico {
  id: string;
  tipo: string;
  nome: string;
  endereco: string | null;
  bairro: string | null;
  avaliacao?: number | null;
  premium?: boolean;
  destaque?: boolean;
  lat?: number;
  lng?: number;
}

interface RotaInfo {
  distancia: string;
  tempo: string;
}

const markerColors: Record<string, string> = {
  veterinario: '#10b981',
  petshop: '#f59e0b',
  creche: '#a855f7',
  hotel: '#3b82f6',
  petsitter: '#f43f5e',
  parque: '#22c55e',
  adestrador: '#0ea5e9',
};

// Ícones 3D (Thiings) em versão pequena (128px, ~20 KB) só para os pinos.
// Os originais em /icons/3d têm ~1 MB cada — pesado demais para dezenas de pinos.
const TIPOS_COM_PINO = new Set([
  'veterinario',
  'petshop',
  'creche',
  'hotel',
  'petsitter',
  'parque',
  'adestrador',
  'petdriver',
]);

function pinoSrc(tipo: string) {
  return `/icons/3d/pins/${TIPOS_COM_PINO.has(tipo) ? tipo : 'patinha'}.png`;
}

// O popup é montado como HTML: nome/endereço vêm do banco e precisam de escape.
function esc(texto: string | null | undefined) {
  return (texto || '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function createIcon(tipo: string) {
  const color = markerColors[tipo] || '#f97316';
  // Boneco 3D "em pé" no mapa, sem moldura. A bolinha colorida (cor do tipo) marca o
  // ponto exato do endereço, e a sombra oval no chão dá a sensação de profundidade.
  return L.divIcon({
    className: '',
    iconSize: [40, 48],
    iconAnchor: [20, 40], // centro da bolinha colorida = ponto exato do endereço
    popupAnchor: [0, -38],
    html: `
      <div style="position:relative;width:40px;height:48px;">
        <div style="position:absolute;left:50%;bottom:0;width:17px;height:5px;border-radius:50%;background:rgba(15,23,42,0.25);transform:translateX(-50%);"></div>
        <div style="position:absolute;left:50%;bottom:2px;width:8px;height:8px;border-radius:50%;background:${color};border:2px solid #fff;transform:translateX(-50%);"></div>
        <img src="${pinoSrc(tipo)}" alt="" width="36" height="36" draggable="false" style="position:absolute;top:0;left:2px;width:36px;height:36px;object-fit:contain;pointer-events:auto;filter:drop-shadow(0 3px 5px rgba(15,23,42,0.28));" />
      </div>
    `,
  });
}

function createUserIcon() {
  return L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `
      <div style="width:24px;height:24px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
    `,
  });
}

// Bolinha com o número de lojas do grupo, nas cores do Patinha.
function createClusterIcon(cluster: L.MarkerCluster) {
  const total = cluster.getChildCount();
  const tamanho = total < 10 ? 36 : total < 100 ? 44 : 52;
  return L.divIcon({
    className: '',
    iconSize: [tamanho, tamanho],
    html: `
      <div style="width:${tamanho}px;height:${tamanho}px;border-radius:50%;background:rgba(249,115,22,0.25);display:flex;align-items:center;justify-content:center;">
        <div style="width:${tamanho - 8}px;height:${tamanho - 8}px;border-radius:50%;background:#f97316;color:white;font:700 13px system-ui;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25);">${total}</div>
      </div>
    `,
  });
}

function addMarkers(
  layer: L.LayerGroup,
  servicos: Servico[],
  onMarkerClick: (servico: Servico) => void
) {
  servicos.forEach((s) => {
    if (!s.lat || !s.lng) return;
    const marker = L.marker([s.lat, s.lng], { icon: createIcon(s.tipo) });
    marker.on('click', () => onMarkerClick(s));
    marker.bindPopup(`
      <div style="min-width:180px;font-family:system-ui;">
        <div style="font-weight:700;font-size:14px;color:#1e293b;">${esc(s.nome)}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">${esc(s.endereco)}</div>
        <div style="font-size:12px;color:#64748b;">${esc(s.bairro)}</div>
        ${
          // Plano grátis: o balão mostra só nome e endereço.
          soLocalizacaoNoMapa(s)
            ? ''
            : `<div style="margin-top:4px;font-size:12px;color:#f59e0b;">⭐ ${s.avaliacao != null ? s.avaliacao.toLocaleString('pt-BR') : 'Novo'}</div>`
        }
      </div>
    `);
    layer.addLayer(marker);
  });
}

export default function PetMap({
  servicos,
  servicoSelecionado,
  onFecharRota,
  centro,
}: {
  servicos: Servico[];
  servicoSelecionado?: Servico | null;
  onFecharRota?: () => void;
  centro?: [number, number];
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.MarkerClusterGroup | null>(null);
  const routeLayer = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [rotaInfo, setRotaInfo] = useState<RotaInfo | null>(null);
  const [carregandoRota, setCarregandoRota] = useState(false);
  const [erroRota, setErroRota] = useState<string | null>(null);

  const handleMarkerClick = useCallback((servico: Servico) => {
    if (servico.lat && servico.lng) {
      mapInstance.current?.setView([servico.lat, servico.lng], 15);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      const center = centro || [-23.421, -51.933];
      const map = L.map(mapRef.current, {
        center,
        zoom: 12,
        // O agrupador de pinos precisa saber o zoom máximo do mapa.
        maxZoom: 19,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;
      markersLayer.current = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        // De perto (nível de rua) mostra cada loja, mesmo vizinhas.
        disableClusteringAtZoom: 17,
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        iconCreateFunction: createClusterIcon,
      }).addTo(map);
      routeLayer.current = L.layerGroup().addTo(map);
    }

    markersLayer.current?.clearLayers();
    addMarkers(markersLayer.current!, servicos, handleMarkerClick);

    const validCoords = servicos.filter((s) => s.lat && s.lng).map((s) => [s.lat!, s.lng!] as [number, number]);
    if (validCoords.length > 0) {
      mapInstance.current.fitBounds(validCoords, { padding: [40, 40] });
    }
  }, [servicos, handleMarkerClick]);

  useEffect(() => {
    if (!mapInstance.current || !centro) return;
    mapInstance.current.setView(centro, 12);
  }, [centro]);

  useEffect(() => {
    if (!servicoSelecionado?.lat || !servicoSelecionado?.lng || !mapInstance.current) {
      return;
    }

    const map = mapInstance.current;
    setCarregandoRota(true);
    setErroRota(null);
    setRotaInfo(null);
    routeLayer.current?.clearLayers();
    userMarkerRef.current?.remove();
    userMarkerRef.current = null;

    map.setView([servicoSelecionado.lat, servicoSelecionado.lng], 14);

    if (!navigator.geolocation) {
      setCarregandoRota(false);
      setErroRota('Geolocalização não disponível');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: userLat, longitude: userLng } = position.coords;
        const destLat = servicoSelecionado.lat!;
        const destLng = servicoSelecionado.lng!;

        const userMarker = L.marker([userLat, userLng], { icon: createUserIcon() })
          .bindPopup('<div style="font-weight:700;font-size:13px;">📍 Sua localização</div>')
          .addTo(map);
        userMarkerRef.current = userMarker;

        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();

          if (data.code !== 'Ok' || !data.routes?.length) {
            setCarregandoRota(false);
            setErroRota('Rota não encontrada');
            return;
          }

          const route = data.routes[0];
          const coords = route.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
          );

          L.polyline(coords, {
            color: '#f97316',
            weight: 5,
            opacity: 0.85,
            dashArray: undefined,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(routeLayer.current!);

          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.round(route.duration / 60);

          setRotaInfo({
            distancia: `${distanceKm} km`,
            tempo: durationMin < 60 ? `${durationMin} min` : `${Math.floor(durationMin / 60)}h ${durationMin % 60}min`,
          });

          const bounds = L.latLngBounds([
            [userLat, userLng],
            [destLat, destLng],
            ...coords,
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });
        } catch {
          setErroRota('Erro ao calcular rota');
        } finally {
          setCarregandoRota(false);
        }
      },
      () => {
        setCarregandoRota(false);
        setErroRota('Permita o acesso à localização');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [servicoSelecionado]);

  useEffect(() => {
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  const fecharRota = () => {
    routeLayer.current?.clearLayers();
    userMarkerRef.current?.remove();
    userMarkerRef.current = null;
    setRotaInfo(null);
    setErroRota(null);
    onFecharRota?.();
  };

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="h-[400px] w-full rounded-2xl ring-1 ring-slate-200 sm:h-[500px]"
      />

      {carregandoRota && (
        <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-slate-200">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <span className="text-sm font-medium text-slate-700">Calculando rota...</span>
        </div>
      )}

      {rotaInfo && (
        <div className="absolute left-4 top-4 z-[1000] flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-slate-200">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-orange-500">🚗</span>
            <span className="font-bold text-slate-900">{rotaInfo.distancia}</span>
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-blue-500">⏱️</span>
            <span className="font-bold text-slate-900">{rotaInfo.tempo}</span>
          </div>
          <button
            onClick={fecharRota}
            className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {erroRota && !carregandoRota && (
        <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-red-200">
          <span className="text-red-500">⚠️</span>
          <span className="text-sm font-medium text-red-700">{erroRota}</span>
          <button
            onClick={fecharRota}
            className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

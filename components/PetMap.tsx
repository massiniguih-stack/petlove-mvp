'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Servico {
  id: string;
  tipo: string;
  nome: string;
  endereco: string;
  bairro: string;
  avaliacao: number | null;
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
};

const emojis: Record<string, string> = {
  veterinario: '🩺',
  petshop: '🛁',
  creche: '🏫',
  hotel: '🏨',
  petsitter: '🐾',
  parque: '🌳',
};

function createIcon(tipo: string) {
  const color = markerColors[tipo] || '#6366f1';
  const emoji = emojis[tipo] || '📍';
  return L.divIcon({
    className: '',
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
    html: `
      <div style="position:relative;width:36px;height:42px;">
        <svg width="36" height="42" viewBox="0 0 36 42" fill="none">
          <path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 18 24 18 24s18-11.4 18-24C36 8.06 27.94 0 18 0z" fill="${color}"/>
          <circle cx="18" cy="17" r="10" fill="white" opacity="0.9"/>
          <text x="18" y="22" text-anchor="middle" font-size="14">${emoji}</text>
        </svg>
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
        <div style="font-weight:700;font-size:14px;color:#1e293b;">${s.nome}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">${s.endereco}</div>
        <div style="font-size:12px;color:#64748b;">${s.bairro}</div>
        <div style="margin-top:4px;font-size:12px;color:#f59e0b;">⭐ ${s.avaliacao != null ? s.avaliacao.toLocaleString('pt-BR') : 'Novo'}</div>
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
  const markersLayer = useRef<L.LayerGroup | null>(null);
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
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;
      markersLayer.current = L.layerGroup().addTo(map);
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

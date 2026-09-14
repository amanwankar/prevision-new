import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ExternalLink, RotateCcw, Compass } from 'lucide-react';
import type { Project } from '../../types';

interface ProjectMapProps {
  project: Project;
}

export const ProjectMap: React.FC<ProjectMapProps> = ({ project }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const latitude = project.latitude ?? project.lat ?? 20.5937;
  const longitude = project.longitude ?? project.lng ?? 78.9629;
  const locationName = project.locationName || project.location_name || 'Project Site';
  const district = project.district || '';
  const state = project.state || 'India';

  // Determine status-specific colors for marker pin
  const getStatusPinColor = (status: string) => {
    switch (status) {
      case 'On Track':
        return '#059669'; // Emerald
      case 'At Risk':
        return '#d97706'; // Amber
      case 'Delayed':
        return '#ea580c'; // Orange
      case 'Critical Overrun':
        return '#dc2626'; // Rose
      case 'Completed':
        return '#2563eb'; // Blue
      default:
        return '#1e40af'; // Slate/Navy
    }
  };

  const pinColor = getStatusPinColor(project.status);

  // Custom SVG icon for high precision & no missing image assets
  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-project-marker',
      html: `
        <div style="position: relative; width: 36px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));">
            <path d="M18 0C8.059 0 0 8.059 0 18C0 27.5 15.5 40.5 17.15 41.87C17.65 42.29 18.35 42.29 18.85 41.87C20.5 40.5 36 27.5 36 18C36 8.059 27.941 0 18 0Z" fill="${color}"/>
            <circle cx="18" cy="17" r="8" fill="#ffffff"/>
            <circle cx="18" cy="17" r="4.5" fill="${color}"/>
          </svg>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42],
      popupAnchor: [0, -42],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // If map instance already exists, remove it before reinitializing
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false, // Prevent page scrolling trap
    });

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Create marker
    const icon = createCustomIcon(pinColor);
    const marker = L.marker([latitude, longitude], { icon }).addTo(map);

    // Create short popup showing project name + status
    const statusBg = project.status === 'On Track' ? '#ecfdf5' : project.status === 'At Risk' ? '#fffbeb' : '#fef2f2';
    const statusTextColor = project.status === 'On Track' ? '#047857' : project.status === 'At Risk' ? '#b45309' : '#b91c1c';

    const popupHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px; padding: 2px;">
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; letter-spacing: 0.5px; margin-bottom: 3px;">
          National Project Site
        </div>
        <div style="font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.35; margin-bottom: 6px;">
          ${project.name}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; background: ${statusBg}; color: ${statusTextColor}; border: 1px solid ${statusTextColor}33;">
            ● ${project.status}
          </span>
          <span style="font-size: 10px; color: #64748b; font-weight: 600;">
            ${project.sector}
          </span>
        </div>
        <div style="font-size: 11px; color: #334155; border-top: 1px solid #f1f5f9; padding-top: 4px; display: flex; align-items: center; gap: 4px;">
          <span>📍</span>
          <span>${district ? `${district}, ` : ''}${state}</span>
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml, {
      closeButton: true,
      autoPan: true,
      className: 'project-site-leaflet-popup',
    });

    // Auto open popup for clear visibility
    marker.openPopup();

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Invalidate map size after DOM mount
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, project.name, project.status, project.sector, district, state, pinColor]);

  // Recenter handler
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 14, { animate: true });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;

  return (
    <div id="project-interactive-map-section" className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
      {/* Map Control Bar & Geolocation Metadata */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-800 flex items-center justify-center shrink-0">
            <Compass size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Project Geolocation & Site Map</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live OpenStreetMap
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin size={12} className="text-rose-500 shrink-0" />
              <span>{locationName}</span>
              {district && <span>• District: <strong className="text-slate-700">{district}</strong></span>}
              <span>• State: <strong className="text-slate-700">{state}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Controls & Coordinates */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Coordinates Tag */}
          <div className="px-2.5 py-1 bg-white border border-slate-200 rounded-md font-mono text-slate-700 text-[11px] shadow-2xs flex items-center gap-1.5">
            <Navigation size={12} className="text-blue-600" />
            <span>
              {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
            </span>
          </div>

          {/* Recenter Button */}
          <button
            type="button"
            onClick={handleRecenter}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-medium text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            title="Recenter map on project coordinates"
          >
            <RotateCcw size={12} />
            <span>Recenter</span>
          </button>

          {/* External Links */}
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-medium text-xs flex items-center gap-1.5 transition shadow-2xs"
            title="View on OpenStreetMap"
          >
            <span>OSM</span>
            <ExternalLink size={11} />
          </a>

          <a
            href={externalMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-md font-medium text-xs flex items-center gap-1.5 transition shadow-2xs"
            title="Open in Google Maps / Satellite"
          >
            <span>Satellite View</span>
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-100">
        <div
          ref={mapContainerRef}
          className="w-full h-full z-0"
          style={{ minHeight: '320px' }}
        />

        {/* Legend Overlay at bottom-left */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-lg shadow-sm border border-slate-200/80 text-[11px] space-y-1">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pinColor }} />
            <span>{project.name}</span>
          </div>
          <div className="text-slate-500 text-[10px] flex items-center gap-2">
            <span>Status: <strong className="text-slate-800">{project.status}</strong></span>
            <span>•</span>
            <span>Zoom: Scroll/Buttons</span>
          </div>
        </div>
      </div>
    </div>
  );
};

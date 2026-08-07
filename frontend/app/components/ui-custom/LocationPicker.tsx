'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Search, Navigation, AlertTriangle, Layers, Satellite } from 'lucide-react'

interface LocationPickerProps {
  latitude?: number | null
  longitude?: number | null
  onChange: (location: { lat: number; lng: number; address: string }) => void
  error?: string | null
  label?: string
}

// ---------------------------------------------------------------------------
// Tile layer definitions
// ---------------------------------------------------------------------------
const TILES = {
  google_streets: {
    label: 'Streets',
    icon: 'streets',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '© Google Maps',
    maxZoom: 21,
  },
  google_hybrid: {
    label: 'Satellite',
    icon: 'satellite',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '© Google Maps',
    maxZoom: 21,
  },
} as const

type TileKey = keyof typeof TILES

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  error,
  label = 'Location',
}: LocationPickerProps) {
  const containerRef    = useRef<HTMLDivElement>(null)
  const mapRef          = useRef<any>(null)
  const markerRef       = useRef<any>(null)
  const tileLayerRef    = useRef<any>(null)
  const initializedRef  = useRef(false)
  const geocodeAbortRef = useRef<AbortController | null>(null)

  const [lat, setLat]                   = useState<number>(latitude ?? 27.7172)
  const [lng, setLng]                   = useState<number>(longitude ?? 85.3240)
  const [address, setAddress]           = useState<string>('')
  const [searchQuery, setSearchQuery]   = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching]       = useState(false)
  const [showResults, setShowResults]   = useState(false)
  const [selected, setSelected]         = useState(false)
  const [activeLayer, setActiveLayer]   = useState<TileKey>('google_streets')

  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef     = useRef<HTMLDivElement>(null)
  const onChangeRef   = useRef(onChange)
  onChangeRef.current = onChange

  const emitChange = useCallback((newLat: number, newLng: number, newAddr: string) => {
    onChangeRef.current({ lat: newLat, lng: newLng, address: newAddr || `${newLat.toFixed(6)}, ${newLng.toFixed(6)}` })
  }, [])

  // ---------------------------------------------------------------------------
  // Reverse geocoding (Nominatim — free, no key needed)
  // ---------------------------------------------------------------------------
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    if (geocodeAbortRef.current) geocodeAbortRef.current.abort()
    const controller = new AbortController()
    geocodeAbortRef.current = controller
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { signal: controller.signal, headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      const displayName = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddress(displayName)
      return displayName
    } catch (err: any) {
      if (err.name === 'AbortError') return ''
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddress(fallback)
      return fallback
    }
  }, [])

  const handleLocationSelect = useCallback(async (newLat: number, newLng: number) => {
    setLat(newLat)
    setLng(newLng)
    setSelected(true)
    const addr = await reverseGeocode(newLat, newLng)
    emitChange(newLat, newLng, addr)
  }, [reverseGeocode, emitChange])

  // ---------------------------------------------------------------------------
  // Map initialization (single-shot)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current
    if (!container || initializedRef.current) return

    let cancelled = false

    const init = async () => {
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')

      if (cancelled || !container) return

      // Clean up any zombie Leaflet instance
      const anyContainer = container as any
      if (anyContainer._leaflet_map) {
        anyContainer._leaflet_map.remove()
        delete anyContainer._leaflet_map
      }

      // Fix default icon URLs
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const initLat = latitude ?? 27.7172
      const initLng = longitude ?? 85.3240

      const map = L.map(container, {
        center: [initLat, initLng],
        zoom: 15,
        zoomControl: false,         // we add it bottom-right below
        attributionControl: false,
      })

      // Custom position for zoom controls
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Attribution — tiny, bottom-left
      L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map)

      // Initial tile layer (Google Streets)
      const tile = TILES.google_streets
      const layer = L.tileLayer(tile.url, {
        subdomains: tile.subdomains as any,
        attribution: tile.attribution,
        maxZoom: tile.maxZoom,
      }).addTo(map)
      tileLayerRef.current = layer
      mapRef.current = map

      // Custom styled marker
      const customIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 32px; height: 32px;
            background: #4F46C8;
            border: 3px solid #fff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          "></div>`,
        iconSize:   [32, 32],
        iconAnchor: [16, 32],
        popupAnchor:[0, -32],
      })

      const marker = L.marker([initLat, initLng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map)
      markerRef.current = marker

      marker.on('dragend', () => {
        const pos = markerRef.current.getLatLng()
        handleLocationSelect(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)))
      })

      map.on('click', (e: any) => {
        const newLat = Number(e.latlng.lat.toFixed(6))
        const newLng = Number(e.latlng.lng.toFixed(6))
        marker.setLatLng([newLat, newLng])
        handleLocationSelect(newLat, newLng)
      })

      initializedRef.current = true

      if (latitude != null && longitude != null) {
        setLat(latitude)
        setLng(longitude)
        setSelected(true)
        const addr = await reverseGeocode(latitude, longitude)
        emitChange(latitude, longitude, addr)
      }
    }

    init()

    return () => {
      cancelled = true
      geocodeAbortRef.current?.abort()
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current   = null
        markerRef.current = null
        tileLayerRef.current = null
      }
      initializedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------------------------------------------------------------------
  // Sync marker when lat/lng state changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (initializedRef.current && mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
      mapRef.current.setView([lat, lng], mapRef.current.getZoom())
    }
  }, [lat, lng])

  // ---------------------------------------------------------------------------
  // Sync when edit-page loads coordinates asynchronously
  // ---------------------------------------------------------------------------
  const prevLatRef = useRef(latitude)
  const prevLngRef = useRef(longitude)
  useEffect(() => {
    const latChanged = latitude != null && prevLatRef.current == null
    const lngChanged = longitude != null && prevLngRef.current == null
    prevLatRef.current = latitude
    prevLngRef.current = longitude
    if (latChanged && lngChanged && initializedRef.current && !selected) {
      setLat(latitude!)
      setLng(longitude!)
      setSelected(true)
      handleLocationSelect(latitude!, longitude!)
    }
  }, [latitude, longitude, selected, handleLocationSelect])

  // ---------------------------------------------------------------------------
  // Tile layer switcher
  // ---------------------------------------------------------------------------
  const switchLayer = useCallback(async (key: TileKey) => {
    if (!mapRef.current) return
    const L = await import('leaflet')
    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current)
    }
    const tile  = TILES[key]
    const layer = L.tileLayer(tile.url, {
      subdomains: tile.subdomains as any,
      attribution: tile.attribution,
      maxZoom: tile.maxZoom,
    }).addTo(mapRef.current)
    tileLayerRef.current = layer
    setActiveLayer(key)
  }, [])

  // ---------------------------------------------------------------------------
  // Click-outside dismiss for search dropdown
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  // ---------------------------------------------------------------------------
  // Search — Photon (photon.komoot.io)
  // Powered by OpenStreetMap + Elasticsearch. Far better than Nominatim for
  // partial queries, local names, and South/Southeast Asian locations.
  // Biased toward the current map center so nearby results rank first.
  // ---------------------------------------------------------------------------
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return }
    setSearching(true)
    try {
      // Bias results toward current map center within ~100 km
      const biasLat = mapRef.current ? mapRef.current.getCenter().lat : lat
      const biasLng = mapRef.current ? mapRef.current.getCenter().lng : lng
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en&lat=${biasLat}&lon=${biasLng}`
      const res  = await fetch(url)
      const data = await res.json()
      // Photon returns GeoJSON FeatureCollection
      setSearchResults(data.features ?? [])
      setShowResults(true)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [lat, lng])

  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchLocation(value), 300)
  }

  const selectSearchResult = (feature: any) => {
    // Photon returns [lon, lat] in coordinates
    const [featureLng, featureLat] = feature.geometry.coordinates
    const props = feature.properties
    // Build a readable display name from Photon properties
    const parts = [
      props.name,
      props.street && props.housenumber ? `${props.street} ${props.housenumber}` : props.street,
      props.district || props.suburb,
      props.city || props.town || props.village,
      props.state,
      props.country,
    ].filter(Boolean)
    const displayName = parts.join(', ')
    setAddress(displayName)
    setSearchQuery(displayName)
    setShowResults(false)
    handleLocationSelect(featureLat, featureLng)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 mb-1 block">
        {label} <span className="text-red-500">*</span>
      </label>

      {/* Search bar */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search for a location..."
            className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4F46C8] focus:ring-2 focus:ring-[#4F46C8]/20 transition"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#4F46C8] border-t-transparent" />
            </div>
          )}
        </div>

        {showResults && searchQuery.trim().length > 0 && !searching && (
          <div className="absolute z-[999] mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
            {searchResults.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {searchResults.map((feature: any, index: number) => {
                  const props = feature.properties
                  const name  = props.name || props.street || 'Unknown place'
                  const sub   = [
                    props.district || props.suburb,
                    props.city || props.town || props.village,
                    props.state,
                    props.country,
                  ].filter(Boolean).join(', ')
                  return (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2.5 hover:bg-[#EEF0FF] transition-colors flex items-start gap-2.5 border-b border-gray-50 last:border-0"
                      onClick={() => selectSearchResult(feature)}
                    >
                      <MapPin size={14} className="mt-0.5 shrink-0 text-[#4F46C8]" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                        {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                No results for <span className="font-medium text-gray-600">"{searchQuery}"</span>
                <p className="text-xs mt-0.5">Try a broader name or drop a pin directly on the map.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map container */}
      <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '380px' }}>
        <div ref={containerRef} className="w-full h-full" style={{ zIndex: 0 }} />

        {/* Tile switcher overlay */}
        <div className="absolute top-3 right-3 z-[400] flex gap-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 p-1">
          <button
            type="button"
            title="Street view"
            onClick={() => switchLayer('google_streets')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeLayer === 'google_streets'
                ? 'bg-[#4F46C8] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers size={13} />
            Streets
          </button>
          <button
            type="button"
            title="Satellite view"
            onClick={() => switchLayer('google_hybrid')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeLayer === 'google_hybrid'
                ? 'bg-[#4F46C8] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Satellite size={13} />
            Satellite
          </button>
        </div>

        {/* "Click to pin" hint when nothing is selected */}
        {!selected && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
            <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap shadow">
              <MapPin size={12} />
              Click anywhere on the map to drop a pin
            </div>
          </div>
        )}
      </div>

      {/* Selected address */}
      {address && (
        <div className="flex items-start gap-2 text-sm text-gray-700 bg-[#EEF0FF] rounded-xl px-4 py-3 border border-[#4F46C8]/10">
          <Navigation size={15} className="mt-0.5 shrink-0 text-[#4F46C8]" />
          <div>
            <p className="text-xs font-semibold text-[#4F46C8] mb-0.5">Selected location</p>
            <p className="text-gray-600 text-xs leading-relaxed">{address}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500 mt-1">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

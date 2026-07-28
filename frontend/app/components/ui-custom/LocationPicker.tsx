'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Search, Navigation, AlertTriangle } from 'lucide-react'

interface LocationPickerProps {
  latitude?: number | null
  longitude?: number | null
  onChange: (location: { lat: number; lng: number; address: string }) => void
  error?: string | null
  label?: string
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  error,
  label = 'Location',
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const initializedRef = useRef(false)
  const geocodeAbortRef = useRef<AbortController | null>(null)

  const [lat, setLat] = useState<number>(latitude ?? 27.7172)
  const [lng, setLng] = useState<number>(longitude ?? 85.3240)
  const [address, setAddress] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selected, setSelected] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const emitChange = useCallback((newLat: number, newLng: number, newAddr: string) => {
    onChangeRef.current({ lat: newLat, lng: newLng, address: newAddr || `${newLat.toFixed(6)}, ${newLng.toFixed(6)}` })
  }, [])

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    if (geocodeAbortRef.current) {
      geocodeAbortRef.current.abort()
    }
    const controller = new AbortController()
    geocodeAbortRef.current = controller

    try {
      const res = await fetch(
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

  // ---------- Map initialization (single-shot) ----------
  useEffect(() => {
    const container = containerRef.current
    if (!container || initializedRef.current) return

    let cancelled = false

    const init = async () => {
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')

      if (cancelled || !container) return

      const anyContainer = container as any
      if (anyContainer._leaflet_map) {
        anyContainer._leaflet_map.remove()
        delete anyContainer._leaflet_map
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      const initLat = latitude ?? 27.7172
      const initLng = longitude ?? 85.3240

      mapRef.current = L.map(container, {
        center: [initLat, initLng],
        zoom: 13,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current)

      markerRef.current = L.marker([initLat, initLng], { draggable: true }).addTo(mapRef.current)

      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng()
        handleLocationSelect(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)))
      })

      mapRef.current.on('click', (e: any) => {
        const newLat = Number(e.latlng.lat.toFixed(6))
        const newLng = Number(e.latlng.lng.toFixed(6))
        markerRef.current.setLatLng([newLat, newLng])
        handleLocationSelect(newLat, newLng)
      })

      initializedRef.current = true

      // Initialize with saved coordinates
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
      if (geocodeAbortRef.current) {
        geocodeAbortRef.current.abort()
      }
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
      initializedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- Sync map marker when lat/lng changes ----------
  useEffect(() => {
    if (initializedRef.current && mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
      mapRef.current.setView([lat, lng], mapRef.current.getZoom())
    }
  }, [lat, lng])

  // ---------- Update when props change (edit page loads coordinates asynchronously) ----------
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

  // ---------- Click-outside search results ----------
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // ---------- Search ----------
  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      setSearchResults(data)
      setShowResults(true)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchLocation(value), 400)
  }

  const selectSearchResult = (result: any) => {
    const newLat = Number(result.lat)
    const newLng = Number(result.lon)
    const displayName = result.display_name
    setAddress(displayName)
    setSearchQuery(displayName)
    setShowResults(false)
    handleLocationSelect(newLat, newLng)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 mb-1 block">
        {label} <span className="text-red-500">*</span>
      </label>

      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a location..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-[#4F46C8] focus:ring-1 focus:ring-[#4F46C8]/30 transition"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-[#4F46C8]" />
            </div>
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-[#EEF0FF] transition flex items-start gap-2 border-b border-gray-50 last:border-0"
                onClick={() => selectSearchResult(result)}
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-[#4F46C8]" />
                <span className="text-gray-700 line-clamp-2">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative w-full rounded-lg overflow-hidden border border-gray-200"
        style={{ height: '300px', zIndex: 0 }}
      />

      {address && (
        <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          <Navigation size={14} className="mt-0.5 shrink-0 text-[#4F46C8]" />
          <span>{address}</span>
        </div>
      )}

      {!selected && !address && (
        <p className="text-xs text-gray-400">Click on the map or search for a location to select it.</p>
      )}

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-500 mt-1">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import "leaflet.heat";
import "leaflet.markercluster/dist/leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149072.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -25],
});

const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    const heatLayer = L.heatLayer(
      points.map(({ lat, lon }) => [lat, lon, 0.5]),
      { radius: 20, blur: 30 }
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

const MapaComOpcoes = () => {
  const [dados, setDados] = useState([]);
  const [modoVisualizacao, setModoVisualizacao] = useState("marcadores");
  const mapRef = useRef(null); // Referência para o mapa
  const markerClusterRef = useRef(null); // Referência para o cluster de marcadores

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/enderecos.json");
        const dadosComCoords = response.data.filter((item) => item.coordenadas);
        setDados(dadosComCoords);
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (mapRef.current && modoVisualizacao === "cluster") {
      const map = mapRef.current;

      // Cria um grupo de clusters
      markerClusterRef.current = L.markerClusterGroup();

      // Adiciona marcadores ao cluster
      dados.forEach((item) => {
        const marker = L.marker([item.coordenadas.lat, item.coordenadas.lon], { icon: customIcon });
        marker.bindPopup(item.endereco);
        markerClusterRef.current.addLayer(marker);
      });

      // Adiciona o cluster ao mapa
      map.addLayer(markerClusterRef.current);

      // Limpeza ao desmontar ou mudar o modo de visualização
      return () => {
        if (markerClusterRef.current) {
          map.removeLayer(markerClusterRef.current);
        }
      };
    }
  }, [dados, modoVisualizacao]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh" }}>
      <div style={{ margin: "10px" }}>
        <button onClick={() => setModoVisualizacao("marcadores")} style={buttonStyle}>Marcadores</button>
        <button onClick={() => setModoVisualizacao("heatmap")} style={buttonStyle}>Heatmap</button>
        <button onClick={() => setModoVisualizacao("cluster")} style={buttonStyle}>Cluster</button>
      </div>

      <div style={{ width: "80vw", height: "80vh", borderRadius: "10px", overflow: "hidden", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }}>
        <MapContainer
          center={[-9.5713, -36.7819]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef} // Referência para o mapa
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {modoVisualizacao === "marcadores" &&
            dados.map((item, index) => (
              <Marker key={index} position={[item.coordenadas.lat, item.coordenadas.lon]} icon={customIcon}>
                <Popup>{item.endereco}</Popup>
              </Marker>
            ))}

          {modoVisualizacao === "heatmap" && (
            <HeatmapLayer points={dados.map((item) => ({ lat: item.coordenadas.lat, lon: item.coordenadas.lon }))} />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

const buttonStyle = {
  margin: "5px",
  padding: "10px 15px",
  borderRadius: "5px",
  background: "#007bff",
  color: "white",
  border: "none",
  cursor: "pointer",
};

export default MapaComOpcoes;

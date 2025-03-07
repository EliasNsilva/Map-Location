import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import "leaflet.heat";
import "leaflet.markercluster/dist/leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const alunoIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/5850/5850276.png",
  // iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149072.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -25],
});

const hospedagemIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/167/167707.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -25],
});

const defaultIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/7051/7051035.png",
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
  const [mostrarCadUnico, setMostrarCadUnico] = useState(true);
  const [mostrarAlunos, setMostrarAlunos] = useState(true);
  const [mostrarHospedagens, setMostrarHospedagens] = useState(true);
  const mapRef = useRef(null);
  const markerClusterRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response1 = await axios.get("/enderecos.json");
        const response2 = await axios.get("/enderecos_alunos.json");
        const response3 = await axios.get("/enderecos_hospedagem.json");
  
        const dados1 = Array.isArray(response1.data) ? response1.data : [];
        const dados2 = Array.isArray(response2.data) ? response2.data : [];
        const dados3 = Array.isArray(response3.data) ? response3.data : [];
  
        const dadosComCoords = [...dados1, ...dados2, ...dados3].filter((item) => item.coordenadas);
  
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
      markerClusterRef.current = L.markerClusterGroup();

      dados.forEach((item) => {
        let icon = alunoIcon;

        if (item.nome) {
          icon = hospedagemIcon; // Diferencia as hospedagens
        } else if (item.code) {
          icon = defaultIcon; // Diferencia os beneficiarios
        }

        const marker = L.marker([item.coordenadas.lat, item.coordenadas.lon], { icon });

        marker.bindPopup(`<strong>${item.endereco}</strong>`);
        markerClusterRef.current.addLayer(marker);
      });

      map.addLayer(markerClusterRef.current);

      return () => {
        if (markerClusterRef.current) {
          map.removeLayer(markerClusterRef.current);
        }
      };
    }
  }, [dados, modoVisualizacao]);

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh" }}>
      <div style={{ width: "200px", padding: "20px", background: "#f4f4f4", borderRadius: "8px" }}>
        <h4>Bases de Dados</h4>
        <div>
          <label>
            <input
              type="checkbox"
              checked={mostrarCadUnico}
              onChange={() => setMostrarCadUnico(!mostrarCadUnico)}
            />
            Beneficiários CRIA
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={mostrarAlunos}
              onChange={() => setMostrarAlunos(!mostrarAlunos)}
            />
            Alunos do Oxetech
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={mostrarHospedagens}
              onChange={() => setMostrarHospedagens(!mostrarHospedagens)}
            />
            Hospedagens SETUR
          </label>
        </div>
        <h4>Modos de exibição</h4>
        <div>
          <button onClick={() => setModoVisualizacao("marcadores")} style={buttonStyle}>Marcadores</button>
        </div>
        <div>
          <button onClick={() => setModoVisualizacao("heatmap")} style={buttonStyle}>Heatmap</button>
        </div>
        <div>
          <button onClick={() => setModoVisualizacao("cluster")} style={buttonStyle}>Cluster</button>
        </div>
      </div>

      <div style={{ width: "80vw", height: "100vh", borderRadius: "10px", overflow: "hidden", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }}>
        <MapContainer
          center={[-9.5713, -36.7819]}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {modoVisualizacao === "marcadores" &&
            dados
              .filter(item => 
                (mostrarAlunos && !item.code && !item.nome) || // Mostrar CAD ÚNICO
                (mostrarCadUnico && item.code) || // Mostrar Alunos do Oxetech
                (mostrarHospedagens && item.nome) // Mostrar Hospedagens
              )
              .map((item, index) => {
                let icon = alunoIcon;
                if (item.nome) {
                  icon = hospedagemIcon;
                } else if (item.code) {
                  icon = defaultIcon;
                }
                return (
                  <Marker key={index} position={[item.coordenadas.lat, item.coordenadas.lon]} icon={icon}>
                    <Popup>{item.endereco} {item.nome ? `(${item.nome})` : ""}</Popup>
                  </Marker>
                );
              })
          }

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

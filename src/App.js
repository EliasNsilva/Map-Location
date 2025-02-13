import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149072.png", // Ícone de uma pessoa
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

const MapaComGeocodificacao = () => {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [endereco, setEndereco] = useState("");
  const [coordenadas, setCoordenadas] = useState({ lat: -9.5713, lon: -36.7819 }); // Estado de Alagoas

  const definirCoordenadas = () => {
    if (!lat || !lon) return;
    setCoordenadas({ lat: parseFloat(lat), lon: parseFloat(lon) });
  };

  const buscarCoordenadasPorEndereco = async () => {
    if (!endereco) return;
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`
      );
      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setCoordenadas({ lat: parseFloat(lat), lon: parseFloat(lon) });
      } else {
        alert("Endereço não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          placeholder="Digite a latitude"
          style={{ marginRight: "5px", padding: "5px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          value={lon}
          onChange={(e) => setLon(e.target.value)}
          placeholder="Digite a longitude"
          style={{ marginRight: "5px", padding: "5px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button onClick={definirCoordenadas} style={{ padding: "5px 10px", borderRadius: "5px", background: "#007bff", color: "white", border: "none", cursor: "pointer" }}>
          Definir Local
        </button>
      </div>
      
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          placeholder="Digite um endereço"
          style={{ marginRight: "5px", padding: "5px", borderRadius: "5px", border: "1px solid #ccc", width: "300px" }}
        />
        <button onClick={buscarCoordenadasPorEndereco} style={{ padding: "5px 10px", borderRadius: "5px", background: "#28a745", color: "white", border: "none", cursor: "pointer" }}>
          Adicionar Endereço
        </button>
      </div>
      
      <div style={{ width: "60vw", height: "50vh", borderRadius: "10px", overflow: "hidden", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }}>
        <MapContainer
          center={[coordenadas.lat, coordenadas.lon]}
          zoom={9}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[coordenadas.lat, coordenadas.lon]} icon={customIcon}>
            <Popup>Local selecionado</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default MapaComGeocodificacao;
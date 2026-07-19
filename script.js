const form = document.getElementById('form-cep');
const cepInput = document.getElementById('cep');
const botao = document.getElementById('buscar');
const resultadoDiv = document.getElementById('resultado');
const legenda = document.getElementById('mapa-legenda');

// --- Mapa (Leaflet + tiles CARTO sobre OpenStreetMap) ---
const mapa = L.map('mapa', { zoomControl: true }).setView([-14.235, -51.925], 4); // centro do Brasil

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  maxZoom: 19
}).addTo(mapa);

let marcador = null;

// --- Máscara automática: 00000-000 ---
cepInput.addEventListener('input', () => {
  let valor = cepInput.value.replace(/\D/g, '').slice(0, 8);
  if (valor.length > 5) {
    valor = valor.slice(0, 5) + '-' + valor.slice(5);
  }
  cepInput.value = valor;
  cepInput.removeAttribute('aria-invalid');
});

form.addEventListener('submit', (evento) => {
  evento.preventDefault();
  buscarCep();
});

async function buscarCep() {
  const cep = cepInput.value.replace(/\D/g, '');

  if (cep.length === 0) {
    mostrarErro('Digite um CEP.');
    return;
  }
  if (cep.length !== 8) {
    mostrarErro('CEP inválido. Digite os 8 números.');
    return;
  }

  definirCarregando(true);

  try {
    // 1) ViaCEP: CEP -> endereço
    const respostaViaCep = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!respostaViaCep.ok) throw new Error('servidor');

    const dados = await respostaViaCep.json();
    if (dados.erro) {
      mostrarErro('CEP não encontrado.');
      return;
    }

    mostrarEndereco(dados);

    // 2) Nominatim: endereço -> latitude/longitude (geocoding)
    await localizarNoMapa(dados);

  } catch (erro) {
    if (!navigator.onLine) {
      mostrarErro('Sem conexão com a internet. Verifique sua rede.');
    } else {
      mostrarErro('Erro ao buscar o CEP. Tente novamente.');
    }
  } finally {
    definirCarregando(false);
  }
}

function mostrarEndereco(dados) {
  const rua = dados.logradouro || 'Não informado pelos Correios';
  const bairro = dados.bairro || 'Não informado pelos Correios';

  resultadoDiv.innerHTML = `
    <dl>
      <dt>Rua</dt><dd>${rua}</dd>
      <dt>Bairro</dt><dd>${bairro}</dd>
      <dt>Cidade</dt><dd>${dados.localidade}</dd>
      <dt>Estado</dt><dd>${dados.uf}</dd>
    </dl>
  `;
}

async function localizarNoMapa(dados) {
  legenda.textContent = 'localizando no mapa...';

  // Monta um endereço legível para o Nominatim buscar
  const partes = [dados.logradouro, dados.bairro, dados.localidade, dados.uf, 'Brasil']
    .filter(Boolean)
    .join(', ');

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(partes)}`;

  const resposta = await fetch(url, {
    headers: { 'Accept-Language': 'pt-BR' }
  });
  const resultados = await resposta.json();

  if (!resultados || resultados.length === 0) {
    legenda.textContent = 'endereço encontrado, mas sem localização exata no mapa';
    return;
  }

  const { lat, lon } = resultados[0];
  const posicao = [parseFloat(lat), parseFloat(lon)];

  mapa.setView(posicao, 16);

  if (marcador) {
    marcador.setLatLng(posicao);
  } else {
    marcador = L.marker(posicao).addTo(mapa);
  }
  marcador.bindPopup(`${dados.logradouro || dados.bairro}, ${dados.localidade} - ${dados.uf}`).openPopup();

  legenda.classList.add('oculta');
}

function mostrarErro(mensagem) {
  cepInput.setAttribute('aria-invalid', 'true');
  resultadoDiv.innerHTML = `<p class="erro">${mensagem}</p>`;
}

function definirCarregando(carregando) {
  botao.disabled = carregando;
  if (carregando) {
    botao.textContent = 'Buscando...';
    resultadoDiv.innerHTML = '<span class="spinner" role="status"></span>Buscando endereço...';
    legenda.classList.remove('oculta');
    legenda.textContent = 'buscando endereço...';
  } else {
    botao.textContent = 'Buscar';
  }
}
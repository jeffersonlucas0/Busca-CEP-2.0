# Busca de CEP

Aplicação simples em HTML, CSS e JavaScript para consultar endereços a partir de um CEP, usando a API pública [ViaCEP](https://viacep.com.br/).

## Funcionalidades

- Busca de endereço por CEP (rua, bairro, cidade e estado)
- Localização exata no mapa (Leaflet + OpenStreetMap), via geocoding com Nominatim
- Máscara automática no formato `00000-000` enquanto digita
- Busca ao pressionar Enter ou clicar no botão
- Indicador de carregamento durante a requisição
- Mensagens de erro específicas (CEP inválido, não encontrado, sem conexão)
- Layout dividido: painel de busca + mapa em tela cheia
- Acessível: labels associados, `aria-live` para leitores de tela, foco visível

## Como funciona (fluxo de dados)

```
CEP digitado
   │
   ▼
ViaCEP  → devolve rua, bairro, cidade, estado
   │
   ▼
Nominatim (geocoding) → converte o endereço em latitude/longitude
   │
   ▼
Leaflet → posiciona o pino no mapa
```

> O ViaCEP não fornece coordenadas — apenas dados de endereço. Por isso é necessário
> um segundo serviço (Nominatim) para converter texto em lat/long antes de exibir no mapa.

## Como usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/busca-cep.git
   ```
2. Abra o arquivo `index.html` no navegador (não precisa de servidor ou build).

## Estrutura do projeto

```
cep-site/
├── index.html   # Estrutura da página
├── style.css    # Estilos e layout
└── script.js    # Lógica de busca e integração com a API
```

## APIs utilizadas

- **[ViaCEP](https://viacep.com.br/)** — dados de endereço a partir do CEP. Gratuita, sem autenticação.
  ```
  https://viacep.com.br/ws/{cep}/json/
  ```
- **[Nominatim](https://nominatim.org/)** — geocoding (endereço → coordenadas), baseado em dados do OpenStreetMap. Gratuita, sem autenticação, mas com limite de uso justo (uma requisição por vez, identificando a origem).
  ```
  https://nominatim.openstreetmap.org/search?format=json&q={endereço}
  ```

> Alguns CEPs retornam rua e bairro vazios. Isso não é um erro da aplicação: significa que os Correios não cadastraram essa informação para o CEP consultado (comum em cidades pequenas ou zonas rurais). Nesses casos, o mapa localiza pelo nível de bairro/cidade disponível.

## Tecnologias

- HTML5
- CSS3 (layout dividido com Flexbox)
- JavaScript (ES6+, `fetch` e `async/await`)
- [Leaflet](https://leafletjs.com/) — biblioteca de mapas interativos

## Licença

Livre para uso e modificação.
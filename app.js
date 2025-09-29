let current_page = 1;
const limit = 24;
let total = 0;

const dialog = document.getElementById("favDialog");
const cancelButton = document.getElementById("cancel");

cancelButton.addEventListener("click", () => {
  dialog.close("closedByUser");
  openCheck(dialog);
});

const modoOscuroGuardado = localStorage.getItem('modoOscuro');
if (modoOscuroGuardado === 'true') {
  document.body.classList.add('dark-mode');
  document.documentElement.classList.add('dark-mode');
}


function devolverTipo(tipo){
  switch(tipo){
    case "normal": return 1;
    case "fighting": return 2;
    case "flying": return 3;
    case "poison": return 4;
    case "ground": return 5;
    case "rock": return 6;
    case "bug": return 7;
    case "ghost": return 8;
    case "steel": return 9;
    case "fire": return 10;
    case "water": return 11;
    case "grass": return 12;
    case "electric": return 13;
    case "psychic": return 14;
    case "ice": return 15;
    case "dragon": return 16;
    case "dark": return 17;
    case "fairy": return 18;
    case "stellar": return 19;
    default: return tipo;
  }

}

function formatearNombre(nombre) {
  return String(nombre).charAt(0).toUpperCase() + String(nombre).slice(1).replaceAll("-", " ");
}

function crearTarjetaPokemon(id, nombre, imgSrc) {
  const art = document.createElement("article");
  art.classList.add("pokemon-card");

  const img = document.createElement("img");
  img.src = imgSrc;

  const nameContainer = document.createElement("div");
  nameContainer.classList.add("name-star");

  const name = document.createElement("span");
  name.textContent = nombre;

  const star = document.createElement("span");
  star.innerHTML = isFavorito(id) ? "★" : "☆";
  star.classList.add("favorite-star");
  star.style.cursor = "pointer";
  star.onclick = (e) => {
    e.stopPropagation();
    toggleFavorite(id, nombre);
    star.innerHTML = isFavorito(id) ? "★" : "☆";
  };

  nameContainer.appendChild(name);
  nameContainer.appendChild(star);
  art.appendChild(img);
  art.appendChild(nameContainer);

  art.addEventListener("click", () => {
    openModal(id, nombre);
  });

  return art;
}

function actualizarDropdown(id, label, items, onSelect) {
  const dropdown = document.getElementById(id);
  dropdown.innerHTML = '';

  const placeholder = document.createElement("option");
  placeholder.textContent = label;
  placeholder.disabled = true;
  placeholder.selected = true;
  dropdown.appendChild(placeholder);

  items.forEach(p => {
    if (!p.id || !p.name) return;
    const option = document.createElement("option");
    option.textContent = p.name;
    option.value = p.id;
    dropdown.appendChild(option);
  });

  dropdown.onchange = () => {
    const selectedId = dropdown.value;
    const selectedName = items.find(p => String(p.id) === selectedId)?.name;
    if (selectedId && selectedName) {
      onSelect(selectedId, selectedName);
    }
    dropdown.selectedIndex = 0;
  };
}

function toggleFavorite(id, name) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  const exists = favoritos.find(p => p.id === id);

  if (exists) {
    favoritos = favoritos.filter(p => p.id !== id);
  } else {
    if (favoritos.length >= 50) {
      alert("Ya alcanzaste el límite de favoritos. Quitá alguno para seguir agregando.");
      return;
    }
    favoritos.push({ id, name });
  }

  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  actualizarFavoritosDropdown();
}

function isFavorito(id) {
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  return favoritos.some(p => p.id === id);
}

function actualizarFavoritosDropdown() {
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  actualizarDropdown("favoritosDropdown", "Favoritos", favoritos, openModal);
}

function agregarReciente(id, name) {
  let recientes = JSON.parse(localStorage.getItem("recientes")) || [];
  recientes = recientes.filter(p => String(p.id) !== String(id));
  recientes.unshift({ id: String(id), name });
  if (recientes.length > 10) {
    recientes = recientes.slice(0, 10);
  }
  localStorage.setItem("recientes", JSON.stringify(recientes));
  actualizarRecientesDropdown();
}

function actualizarRecientesDropdown() {
  const recientes = JSON.parse(localStorage.getItem("recientes")) || [];
  actualizarDropdown("recientesDropdown", "Recientes", recientes, openModal);
}

function openModal(pokemonId, name) {
  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    .then(response => {
      if (!response.ok) throw new Error("No se pudo cargar el Pokémon");
      return response.json();
    })
    .then(data => {
      const modalContent = document.getElementById("modalContent");
      modalContent.innerHTML = ""; // Limpiar contenido previo

      const container = document.createElement("div");
      container.classList.add("modal-container");

      const title = document.createElement("h2");
      title.classList.add("pokemon-name");
      title.textContent = name;
      container.appendChild(title);

      const img = document.createElement("img");
      img.src = data.sprites.other['official-artwork'].front_default;
      img.alt = name;
      img.style.maxWidth = "150px";
      img.style.display = "block";
      img.style.margin = "0 auto";
      container.appendChild(img);

      const sections = [
        { label: "Número", content: `#${pokemonId}` },
        {
          label: "Tipos",
          content: data.types.map(t => {
            const tipoId = devolverTipo(t.type.name);
            return `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/omega-ruby-alpha-sapphire/${tipoId}.png" alt="${t.type.name}" style="max-width: 50px;">`;
          }).join(" ")
        },
        {
          label: "Habilidades",
          content: data.abilities.map(a => formatearNombre(a.ability.name)).join(", ")
        },
        {
        label: "Medidas",
        content: `
          <div class="medidas">
            <span><strong>Altura:</strong> ${data.height / 10} m</span>
            <span><strong>Peso:</strong> ${data.weight / 10} kg</span>
          </div>
        `
      }

      ];

      sections.forEach(({ label, content }) => {
        const section = document.createElement("div");
        section.classList.add("modal-section");

        const heading = document.createElement("h3");
        heading.textContent = label;
        section.appendChild(heading);

        const body = document.createElement("div");
        body.innerHTML = content;
        section.appendChild(body);

        container.appendChild(section);
      });

      modalContent.appendChild(container);
      dialog.showModal();
    });
}


function numPages() {
  return Math.ceil(total / limit);
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = numPages();
  const buffer = 2;

  function createPageItem(p, label = p) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "javascript:void(0)";
    a.innerText = label;
    a.onclick = () => changePage(p);
    if (p === current_page) {
      li.classList.add("current");
    }
    li.appendChild(a);
    pagination.appendChild(li);
  }

  createPageItem(1);

  if (current_page > buffer + 2) {
    pagination.appendChild(document.createElement("li")).innerText = "...";
  }

  for (let i = current_page - buffer; i <= current_page + buffer; i++) {
    if (i > 1 && i < totalPages) {
      createPageItem(i);
    }
  }

  if (current_page < totalPages - buffer - 1) {
    pagination.appendChild(document.createElement("li")).innerText = "...";
  }

  if (totalPages > 1) {
    createPageItem(totalPages);
  }
}

function changePage(page) {
  if (page < 1) page = 1;
  if (page > numPages()) page = numPages();
  current_page = page;
  const offset = (page - 1) * limit;

  fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
    .then(response => response.json())
    .then(listaPokemon => {
      document.getElementById("pokemonList").innerHTML = "";

      listaPokemon.results.forEach(pokemon => {
        const token = pokemon.url.split("/");
        const id = token[token.length - 2];
        const nombre = formatearNombre(pokemon.name);
        const imgSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        const art = crearTarjetaPokemon(id, nombre, imgSrc);
        document.getElementById("pokemonList").appendChild(art);
      });
    });

  renderPagination();
}

function buscarPokemon() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!query) return;

  fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
    .then(response => {
      if (!response.ok) throw new Error("Pokémon no encontrado");
      return response.json();
    })
    .then(pokemon => {
      document.getElementById("pokemonList").innerHTML = "";

      const id = pokemon.id;
      const nombre = formatearNombre(pokemon.name);
      const imgSrc = pokemon.sprites.other["official-artwork"].front_default;

      agregarReciente(id, nombre);

      const art = crearTarjetaPokemon(id, nombre, imgSrc);
      document.getElementById("pokemonList").appendChild(art);
    })
    .catch(error => {
      document.getElementById("pokemonList").innerHTML = `<p style="text-align:center;">${error.message}</p>`;
    });
}

document.getElementById('toggleDarkMode').addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-mode');
  document.documentElement.classList.toggle('dark-mode', isDark);
  localStorage.setItem('modoOscuro', isDark ? 'true' : 'false');
});


fetch('https://pokeapi.co/api/v2/pokemon/?limit=1')
  .then(response => response.json())
  .then(data => {
    total = data.count;
    changePage(1);
    actualizarFavoritosDropdown();
    actualizarRecientesDropdown(); 
  });

var current_page = 1;
var limit = 24;
var total = 0;
const dialog = document.getElementById("favDialog");
const cancelButton = document.getElementById("cancel");

cancelButton.addEventListener("click", () => {
  dialog.close("closedByUser");
  openCheck(dialog);
});


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


fetch('https://pokeapi.co/api/v2/pokemon/?limit=1')
  .then(response => response.json())
  .then(data => {
    total = data.count;
    changePage(1);
    actualizarFavoritosDropdown();
    actualizarRecientesDropdown(); 
  });


function numPages() {
  return Math.ceil(total / limit);
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
  const art = document.createElement("article");
  art.classList.add("pokemon-card");

  const token = pokemon.url.split("/");
  const id = token[token.length - 2];

  const img = document.createElement("img");
  img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  const nameContainer = document.createElement("div");
  nameContainer.classList.add("name-star");

  const name = document.createElement("span");
  let nombre = String(pokemon.name).charAt(0).toUpperCase() + String(pokemon.name).slice(1);
  name.textContent = nombre.replaceAll("-", " ");

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

  document.getElementById("pokemonList").appendChild(art);
});

    });

  renderPagination();
}

function openModal(pokemonId, name) {
  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    .then(response => {
      if (!response.ok) throw new Error("No se pudo cargar el Pokémon");
      return response.json();
    })
    .then(data => {
      const modalContent = document.getElementById("modalContent");

      const tipos = data.types.map(t => {
        const tipo = t.type.name;
        const tipoId = devolverTipo(tipo);
        return `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/omega-ruby-alpha-sapphire/${tipoId}.png" alt="${tipo}" style="max-width: 50px;">`;
      }).join("");

      const habilidades = data.abilities.map(a => {
        return a.ability.name.charAt(0).toUpperCase() + a.ability.name.slice(1);
      }).join(" ");

      modalContent.innerHTML = `
        <h2>${name}</h2>
        <img src="${data.sprites.other['official-artwork'].front_default}" alt="${name}" style="max-width: 150px;">
        <p>Número: ${pokemonId}</p>
        <p>Tipos</p>
        ${tipos}
        <p>Habilidades</p>
        <p>${habilidades}</p>
        <p>Altura: ${data.height / 10} m</p>
        <p>Peso: ${data.weight / 10} kg</p>
      `;
      dialog.showModal();
    });
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
    const li = document.createElement("li");
    li.innerText = "...";
    pagination.appendChild(li);
  }

  for (let i = current_page - buffer; i <= current_page + buffer; i++) {
    if (i > 1 && i < totalPages) {
      createPageItem(i);
    }
  }

  if (current_page < totalPages - buffer - 1) {
    const li = document.createElement("li");
    li.innerText = "...";
    pagination.appendChild(li);
  }

  if (totalPages > 1) {
    createPageItem(totalPages);
  }
}

function toggleFavorite(id, name) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  const exists = favoritos.find(p => p.id === id);

  if (exists) {
    favoritos = favoritos.filter(p => p.id !== id);
  } else {
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
  const dropdown = document.getElementById("favoritosDropdown");
  dropdown.innerHTML = '';

  const placeholder = document.createElement("option");
  placeholder.textContent = "Favoritos";
  placeholder.disabled = true;
  placeholder.selected = true;
  dropdown.appendChild(placeholder);

  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  favoritos.forEach(p => {
    const option = document.createElement("option");
    option.textContent = p.name;
    option.value = p.id;
    dropdown.appendChild(option);
  });

  dropdown.onchange = () => {
    const selectedId = dropdown.value;
    const selectedName = favoritos.find(p => p.id === selectedId)?.name;
    if (selectedId && selectedName) {
      openModal(selectedId, selectedName);
    }
    dropdown.selectedIndex = 0; 
  };
}

function actualizarRecientesDropdown() {
  const dropdown = document.getElementById("recientesDropdown");
  dropdown.innerHTML = '';

  const placeholder = document.createElement("option");
  placeholder.textContent = "Recientes";
  placeholder.disabled = true;
  placeholder.selected = true;
  dropdown.appendChild(placeholder);

  const recientes = JSON.parse(localStorage.getItem("recientes")) || [];
  recientes.forEach(p => {
    if (!p.id || !p.name) return;
    const option = document.createElement("option");
    option.textContent = p.name;
    option.value = p.id;
    dropdown.appendChild(option);
  });

  dropdown.onchange = () => {
    const selectedId = dropdown.value;
    const selectedName = recientes.find(p => String(p.id) === selectedId)?.name;
    if (selectedId && selectedName) {
      openModal(selectedId, selectedName);
    }
    dropdown.selectedIndex = 0;
  };
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

      const art = document.createElement("article");
      art.classList.add("pokemon-card");

      const id = pokemon.id;
      const nombre = String(pokemon.name).charAt(0).toUpperCase() + String(pokemon.name).slice(1).replaceAll("-", " ");

      // ✅ Agregar a Recientes
      agregarReciente(id, nombre);

      const img = document.createElement("img");
      img.src = pokemon.sprites.other["official-artwork"].front_default;

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

      document.getElementById("pokemonList").appendChild(art);
    })
    .catch(error => {
      document.getElementById("pokemonList").innerHTML = `<p style="text-align:center;">${error.message}</p>`;
    });
}


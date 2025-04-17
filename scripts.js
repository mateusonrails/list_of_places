const inputElement = document.querySelector(".new-place-input");
const addPlaceButton = document.querySelector(".new-place-button");
const placesContainer = document.querySelector(".places-container");

// Validação do input
const validateInput = () => inputElement.value.trim().length > 0;

// Manipulador de mudança no input
const handleInputChange = () => {
  const inputIsValid = validateInput();
  if (inputIsValid) {
    inputElement.classList.remove("error");
  }
};

// Adicionar novo lugar
const handleAddPlace = async () => {
  const inputIsValid = validateInput();

  if (!inputIsValid) {
    return inputElement.classList.add("error");
  }

  try {
    const response = await fetch('/.netlify/functions/savePlace', {
      method: 'POST',
      body: JSON.stringify({
        description: inputElement.value,
        isCompleted: false
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao adicionar lugar');
    }

    inputElement.value = "";
    await fetchPlaces(); // Recarrega a lista após adicionar
  } catch (error) {
    console.error("Erro ao adicionar lugar:", error);
  }
};

// Carregar lugares do banco de dados
const fetchPlaces = async () => {
  try {
    const response = await fetch('/.netlify/functions/getPlaces');
    
    if (!response.ok) {
      throw new Error('Falha ao carregar lugares');
    }

    const places = await response.json();
    renderPlaces(places);
  } catch (error) {
    console.error("Erro ao carregar lugares:", error);
  }
};

// Renderizar lugares na tela
const renderPlaces = (places) => {
  placesContainer.innerHTML = '';

  places.forEach(place => {
    const placeItemContainer = document.createElement("div");
    placeItemContainer.classList.add("place-item");

    const placeContent = document.createElement("p");
    placeContent.innerText = place.description;

    if (place.isCompleted) {
      placeContent.classList.add("completed");
    }

    placeContent.addEventListener("click", () => handleTogglePlace(place));

    const deleteItem = document.createElement("i");
    deleteItem.classList.add("far");
    deleteItem.classList.add("fa-trash-alt");
    deleteItem.addEventListener("click", () => handleDeletePlace(place));

    placeItemContainer.appendChild(placeContent);
    placeItemContainer.appendChild(deleteItem);
    placesContainer.appendChild(placeItemContainer);
  });
};

// Alternar status de completado
const handleTogglePlace = async (place) => {
  try {
    const response = await fetch('/.netlify/functions/updatePlace', {
      method: 'POST',
      body: JSON.stringify({
        id: place.id,
        isCompleted: !place.isCompleted
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao atualizar lugar');
    }

    await fetchPlaces(); // Recarrega a lista após atualizar
  } catch (error) {
    console.error("Erro ao atualizar lugar:", error);
  }
};

// Deletar lugar
const handleDeletePlace = async (place) => {
  try {
    const response = await fetch('/.netlify/functions/deletePlace', {
      method: 'POST',
      body: JSON.stringify({ id: place.id }),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Falha ao deletar lugar');
    }

    await fetchPlaces(); // Recarrega a lista após deletar
  } catch (error) {
    console.error("Erro ao deletar lugar:", error);
  }
};

// Event Listeners
addPlaceButton.addEventListener("click", handleAddPlace);
inputElement.addEventListener("change", handleInputChange);

// Carregar lugares quando a página for carregada
document.addEventListener('DOMContentLoaded', fetchPlaces);
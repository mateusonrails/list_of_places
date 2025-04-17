const API_URL = "https://osuxqn1pz1.execute-api.us-east-1.amazonaws.com";

const inputElement = document.querySelector(".new-place-input");
const addPlaceButton = document.querySelector(".new-place-button");
const placesContainer = document.querySelector(".places-container");

const validateInput = () => inputElement.value.trim().length > 0;

const handleAddPlace = async () => {
  const inputIsValid = validateInput();
  if (!inputIsValid) return inputElement.classList.add("error");

  const newPlace = {
    description: inputElement.value,
    isCompleted: false
  };

  createPlaceElement(newPlace);
  inputElement.value = "";
  await savePlacesToAPI();
};

const handleClick = (placeContent) => {
  placeContent.classList.toggle("completed");
  savePlacesToAPI();
};

const handleDeleteClick = (placeItemContainer) => {
  placeItemContainer.remove();
  savePlacesToAPI();
};

const handleInputChange = () => {
  if (validateInput()) {
    inputElement.classList.remove("error");
  }
};

const createPlaceElement = (place) => {
  const placeItemContainer = document.createElement("div");
  placeItemContainer.classList.add("place-item");

  const placeContent = document.createElement("p");
  placeContent.innerText = place.description;
  if (place.isCompleted) {
    placeContent.classList.add("completed");
  }

  placeContent.addEventListener("click", () => handleClick(placeContent));

  const deleteItem = document.createElement("i");
  deleteItem.classList.add("far", "fa-trash-alt");
  deleteItem.addEventListener("click", () => handleDeleteClick(placeItemContainer));

  placeItemContainer.appendChild(placeContent);
  placeItemContainer.appendChild(deleteItem);
  placesContainer.appendChild(placeItemContainer);
};

const savePlacesToAPI = async () => {
  const places = [...placesContainer.childNodes].map((place) => {
    const content = place.firstChild;
    const isCompleted = content.classList.contains("completed");
    return { description: content.innerText, isCompleted };
  });

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ places })
    });
  } catch (err) {
    console.error("Erro ao salvar:", err);
  }
};

const loadPlacesFromAPI = async () => {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (data && data.places) {
      data.places.forEach(place => createPlaceElement(place));
    }
  } catch (err) {
    console.error("Erro ao carregar:", err);
  }
};

addPlaceButton.addEventListener("click", () => handleAddPlace());
inputElement.addEventListener("change", () => handleInputChange());

loadPlacesFromAPI();

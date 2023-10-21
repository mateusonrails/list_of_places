const inputElement = document.querySelector(".new-place-input");
const addPlaceButton = document.querySelector(".new-place-button");

const placesContainer = document.querySelector(".places-container")

const validateInput = () => inputElement.value.trim().length > 0;

const handleAddPlace = () => {
  const inputIsValid = validateInput();

  console.log(inputIsValid);

  if (!inputIsValid) {
    return inputElement.classList.add("error");
  }

  const placeItemContainer = document.createElement("div");
  placeItemContainer.classList.add("place-item");

  const placeContent = document.createElement("p");
  placeContent.innerText = inputElement.value;

  placeContent.addEventListener("click", () => handleClick(placeContent));

  const deleteItem = document.createElement("i");
  deleteItem.classList.add("far");
  deleteItem.classList.add("fa-trash-alt");

  deleteItem.addEventListener("click", () =>
    handleDeleteClick(placeItemContainer, placeContent)
  );

  placeItemContainer.appendChild(placeContent);
  placeItemContainer.appendChild(deleteItem);

  placesContainer.appendChild(placeItemContainer);

  inputElement.value = "";

  updateLocalStorage();
};

const handleClick = (placeContent) => {
  const places = placesContainer.childNodes;

  for (const place of places) {
    const currentPlaceIsBeingClicked = place.firstChild.isSameNode(placeContent);

    if (currentPlaceIsBeingClicked) {
      place.firstChild.classList.toggle("completed");
    }
  }

  updateLocalStorage();
};

const handleDeleteClick = (placeItemContainer, placeContent) => {
  const places = placesContainer.childNodes;

  for (const place of places) {
    const currentPlaceIsBeingClicked = place.firstChild.isSameNode(placeContent);

    if (currentPlaceIsBeingClicked) {
      placeItemContainer.remove();
    }
  }

  updateLocalStorage();
};

const handleInputChange = () => {
  const inputIsValid = validateInput();

  if (inputIsValid) {
    return inputElement.classList.remove("error");
  }
};

const updateLocalStorage = () => {
  const places = placesContainer.childNodes;

  const localStoragePlaces = [...places].map((place) => {
    const content = place.firstChild;
    const isCompleted = content.classList.contains("completed");

    return { description: content.innerText, isCompleted };
  });

  localStorage.setItem("places", JSON.stringify(localStoragePlaces));
};

const refreshPlacesUsingLocalStorage = () => {
  const placesFromLocalStorage = JSON.parse(localStorage.getItem("places"));

  if (!placesFromLocalStorage) return;

  for (const place of placesFromLocalStorage) {
    const placeItemContainer = document.createElement("div");
    placeItemContainer.classList.add("place-item");

    const placeContent = document.createElement("p");
    placeContent.innerText = place.description;

    if (place.isCompleted) {
      placeContent.classList.add("completed");
    }

    placeContent.addEventListener("click", () => handleClick(placeContent));

    const deleteItem = document.createElement("i");
    deleteItem.classList.add("far");
    deleteItem.classList.add("fa-trash-alt");

    deleteItem.addEventListener("click", () =>
      handleDeleteClick(placeItemContainer, placeContent)
    );

    placeItemContainer.appendChild(placeContent);
    placeItemContainer.appendChild(deleteItem);

    placesContainer.appendChild(placeItemContainer);
  }
};



refreshPlacesUsingLocalStorage();

addPlaceButton.addEventListener("click", () => handleAddPlace());

inputElement.addEventListener("change", () => handleInputChange());

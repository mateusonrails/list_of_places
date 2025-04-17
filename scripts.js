document.addEventListener('DOMContentLoaded', async () => {
  const input = document.querySelector('.new-place-input');
  const button = document.querySelector('.new-place-button');
  const container = document.querySelector('.places-container');
  let useLocalStorage = false;

  const checkAPI = async () => {
    try {
      const response = await fetch('/.netlify/functions/getPlaces');
      return response.ok;
    } catch {
      return false;
    }
  };

  const initLocalFallback = () => {
    useLocalStorage = true;
    console.log('Usando localStorage como fallback');
    if (localStorage.getItem('places')) {
      renderPlaces(JSON.parse(localStorage.getItem('places')));
    }
  };

  const renderPlaces = (places) => {
    container.innerHTML = '';
    places.forEach(place => {
      const placeItem = document.createElement('div');
      placeItem.className = 'place-item';
      
      const placeText = document.createElement('p');
      placeText.textContent = place.description;
      if (place.isCompleted) placeText.classList.add('completed');
      
      const deleteIcon = document.createElement('i');
      deleteIcon.className = 'far fa-trash-alt';
      
      placeText.addEventListener('click', () => toggleComplete(place, placeText));
      deleteIcon.addEventListener('click', () => deletePlace(place, placeItem));
      
      placeItem.append(placeText, deleteIcon);
      container.appendChild(placeItem);
    });
  };

  const getPlaces = async () => {
    if (useLocalStorage) {
      return JSON.parse(localStorage.getItem('places')) || [];
    }
    
    try {
      const response = await fetch('/.netlify/functions/getPlaces');
      return await response.json();
    } catch {
      initLocalFallback();
      return JSON.parse(localStorage.getItem('places')) || [];
    }
  };

  const savePlace = async (description) => {
    const newPlace = { description, isCompleted: false };
    
    if (useLocalStorage) {
      const places = JSON.parse(localStorage.getItem('places')) || [];
      places.push(newPlace);
      localStorage.setItem('places', JSON.stringify(places));
      return newPlace;
    }
    
    try {
      const response = await fetch('/.netlify/functions/savePlace', {
        method: 'POST',
        body: JSON.stringify(newPlace),
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch {
      initLocalFallback();
      return savePlace(description); // Chama recursivamente em modo local
    }
  };

  const deletePlace = async (place, element) => {
    if (useLocalStorage) {
      const places = JSON.parse(localStorage.getItem('places')).filter(p => 
        p.description !== place.description
      );
      localStorage.setItem('places', JSON.stringify(places));
      element.remove();
      return;
    }
    
    try {
      await fetch('/.netlify/functions/deletePlace', {
        method: 'POST',
        body: JSON.stringify({ id: place.id }),
        headers: { 'Content-Type': 'application/json' }
      });
      element.remove();
    } catch {
      initLocalFallback();
      deletePlace(place, element); // Chama recursivamente em modo local
    }
  };

  const toggleComplete = async (place, element) => {
    place.isCompleted = !place.isCompleted;
    element.classList.toggle('completed');
    
    if (useLocalStorage) {
      const places = JSON.parse(localStorage.getItem('places'));
      const index = places.findIndex(p => p.description === place.description);
      if (index !== -1) places[index].isCompleted = place.isCompleted;
      localStorage.setItem('places', JSON.stringify(places));
      return;
    }
    
    try {
      await fetch('/.netlify/functions/updatePlace', {
        method: 'POST',
        body: JSON.stringify({
          id: place.id,
          isCompleted: place.isCompleted
        }),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch {
      initLocalFallback();
      toggleComplete(place, element); // Chama recursivamente em modo local
    }
  };

  // Inicialização
  const apiAvailable = await checkAPI();
  if (!apiAvailable) initLocalFallback();
  renderPlaces(await getPlaces());

  // Event Listeners
  button.addEventListener('click', async () => {
    if (input.value.trim() === '') {
      input.classList.add('error');
      return;
    }
    
    await savePlace(input.value.trim());
    input.value = '';
    input.classList.remove('error');
    renderPlaces(await getPlaces());
  });

  input.addEventListener('input', () => {
    if (input.value.trim() !== '') {
      input.classList.remove('error');
    }
  });
});
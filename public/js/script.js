document.addEventListener("DOMContentLoaded", () => {
  /* Image Preview for Create/Edit */
  const input = document.querySelector("#imageInput");
  const preview = document.querySelector("#imagePreview");

  if (input && preview) {
    input.addEventListener("change", () => {
      const file = input.files?.[0];

      if (!file) {
        preview.src = "";
        preview.classList.add("hidden");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please select an image.");
        input.value = "";
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        preview.src = event.target.result;
        preview.classList.remove("hidden");
      };

      reader.readAsDataURL(file);
    });
  }

  /* Map */
  if (window.listingMapData && window.listingMapData.token && window.mapboxgl) {
    mapboxgl.accessToken = window.listingMapData.token;

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: window.listingMapData.coordinates,
      zoom: 11
    });

    new mapboxgl.Marker()
      .setLngLat(window.listingMapData.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<strong>${window.listingMapData.title}</strong>`)
      )
      .addTo(map);
  }
});

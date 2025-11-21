// app.js
import { saveCards, loadCards } from "./localstorage";

export default function createCard(textContent) {
  const card = document.createElement("div");
  card.classList.add("card");
  const text = document.createElement("span");
  text.classList.add("text");
  text.textContent = textContent;

  const removeBtn = document.createElement("button");
  removeBtn.classList.add("close");
  const cross = document.createElement("span");
  cross.classList.add("cross");
  cross.textContent = "×";

  removeBtn.append(cross);
  card.append(text);
  card.append(removeBtn);
  removeBtn.addEventListener("click", deleteCard);
  removeBtn.addEventListener("mousedown", (e) => {
    e.stopPropagation();
  });

  return card;
}

function deleteCard(e) {
  e.preventDefault();
  const el = e.currentTarget;
  const parent = el.closest(".card");
  parent.remove();
  saveCards();
}

document.addEventListener("DOMContentLoaded", () => {
  const toDoCards = document.querySelector(".todo");
  const inProgressCards = document.querySelector(".inProgress");
  const doneCards = document.querySelector(".done");
  const addBtns = document.querySelectorAll(".add-card-btn");

  function createTextForm(e) {
    const el = e.currentTarget;
    const parent = el.closest(".collumn");

    const currentForm = document.querySelector(".form-container");
    if (currentForm) {
      currentForm.remove();
    }

    const formContainer = document.createElement("div");
    formContainer.classList.add("form-container");
    const form = document.createElement("form");
    form.classList.add("form");

    const field = document.createElement("textarea");
    field.classList.add("text-field");
    field.placeholder = "Enter a title for this card ...";
    field.addEventListener("mousedown", (event) => {
      event.stopPropagation();
    });

    const createBtn = document.createElement("button");
    createBtn.classList.add("formBtn", "create-card");
    createBtn.textContent = "Add Card";

    const closeBtn = document.createElement("button");
    closeBtn.classList.add("cross", "close-form");
    closeBtn.textContent = "\u2715";

    form.append(field);
    form.append(createBtn);
    form.append(closeBtn);
    formContainer.append(form);

    if (parent.querySelector(".todo")) {
      createBtn.classList.add("toDoCollumn");
      toDoCards.append(formContainer);
    } else if (parent.querySelector(".inProgress")) {
      createBtn.classList.add("inProgressCollumn");
      inProgressCards.append(formContainer);
    } else if (parent.querySelector(".done")) {
      createBtn.classList.add("doneCollumn");
      doneCards.append(formContainer);
    }

    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      formContainer.remove();
    });

    createBtn.addEventListener("click", addNewCard);
  }

  addBtns.forEach((button) => {
    button.addEventListener("click", createTextForm);
  });

  function addNewCard(e) {
    e.preventDefault();
    const el = e.currentTarget;
    const formContainer = document.querySelector(".form-container");
    const field = document.querySelector(".text-field");
    if (field.value.trim() === "") {
      return;
    }
    const card = createCard(field.value);

    if (el.classList.contains("toDoCollumn")) {
      toDoCards.append(card);
    } else if (el.classList.contains("inProgressCollumn")) {
      inProgressCards.append(card);
    } else if (el.classList.contains("doneCollumn")) {
      doneCards.append(card);
    }
    formContainer.remove();
    saveCards();
  }

  loadCards(toDoCards, inProgressCards, doneCards);

  // BEGIN DRAG AND DROP IMPLEMENTATION
  let activeElement;
  let shiftX, shiftY;
  const container = document.querySelector(".tasks-container");

  function createPlaceholder() {
    const placeEl = document.createElement("div");
    placeEl.classList.add("placeholder");
    placeEl.style.width = activeElement.offsetWidth + "px";
    placeEl.style.height = activeElement.offsetHeight + "px";
    return placeEl;
  }

  function removePlaceholder() {
    const placeEl = document.querySelector(".placeholder");
    if (!placeEl) return;
    placeEl.remove();
  }

  function startDragging(e) {
    e.preventDefault();
    activeElement = e.target.closest(".card");
    if (!activeElement) {
      return;
    }

    const { left, top } = activeElement.getBoundingClientRect();
    shiftX = e.clientX - left;
    shiftY = e.clientY - top;
    activeElement.classList.add("dragged");

    document.body.classList.add("dragging-active");
    container.addEventListener("mousemove", dragging);
    container.addEventListener("mouseup", stopDragging);
  }

  function dragging(e) {
    e.preventDefault();
    activeElement.style.position = "absolute";
    activeElement.style.top = e.clientY - shiftY + "px";
    activeElement.style.left = e.clientX - shiftX + "px";

    removePlaceholder();
    const placeEl = createPlaceholder();
    const overItem = e.target;
    const closestCard = overItem.closest(".card");

    if (!closestCard) {
      const closestCardContainer = overItem.closest(".cards-list");
      if (!closestCardContainer) return;
      closestCardContainer.append(placeEl);
    } else {
      const parentElement = closestCard.closest(".cards-list");
      parentElement.insertBefore(placeEl, closestCard);
    }
  }

  function stopDragging(e) {
    e.preventDefault();
    document.body.classList.remove("dragging-active");

    const placeEl = document.querySelector(".placeholder");
    if (!placeEl) return;

    const parentElement = placeEl.parentElement;
    parentElement.insertBefore(activeElement, placeEl.nextSibling);
    removePlaceholder();

    activeElement.classList.remove("dragged");
    activeElement.style.position = "";
    activeElement.style.top = "";
    activeElement.style.left = "";

    container.removeEventListener("mousemove", dragging);
    container.removeEventListener("mouseup", stopDragging);

    saveCards();
  }

  container.addEventListener("mousedown", startDragging);

  // END OF DRAG AND DROP IMPLEMENTATION
});

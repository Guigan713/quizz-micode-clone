import './style.css';
import { Questions } from "./questions";

const TIMEOUT = 4000;

const app = document.querySelector("#app")
const startButton = document.querySelector("#start");

startButton.addEventListener("click", startQuizz);

function startQuizz(event) {
  //event.stopPropagation();
  let currentQuestion = 0;
  let score = 0;


  displayQuestion(currentQuestion)

  function clean() {
    while (app.firstElementChild) {
      app.firstElementChild.remove()
    }
    // ici Questions.legth correspond au paramètre max de la fonction getProgressBar(voir la fonction)
    // currentQuestion correspond quant à lui à value
    const progress = getProgressBar(Questions.length, currentQuestion);
    app.appendChild(progress);
  }

  function displayQuestion(index) {
    clean();
    const question = Questions[index];

    if (!question) {
      displayFinishMessage();
      return;
    }

    const title = getTitleElement(question.question);
    app.appendChild(title);
    const answersDiv = createAnswers(question.answers);
    app.appendChild(answersDiv);

    const submitButton = getSubmitButton();

    submitButton.addEventListener("click", submit);
    app.appendChild(submitButton);
  }

  // cette fonction permet d'afficher le message de fin de quizz
  // on créé 1 élément h1 et un élément p qui contiendront du texte et des infos
  // La méthode Node.appendChild() ajoute un nœud à la fin de la liste des enfants d'un nœud parent spécifié
  // ici cela va ajouter les éléments dans le bloc du quizz
  // en gros cela ajoute les élémets dans le DOM
  function displayFinishMessage() {
    const h1 = document.createElement("h1");
    h1.innerText = "Bravo ! Tu as terminé le quizz."
    const p = document.createElement("p");
    p.innerText = `Tu as eu ${score} sur ${Questions.length} point !`;

    app.appendChild(h1);
    app.appendChild(p);
  }

  function submit() {
    const selectedAnswer = app.querySelector('input[name="answer"]:checked');

    disableAllAnswers();

    const value = selectedAnswer.value;

    const question = Questions[currentQuestion];

    const isCorrect = question.correct === value;

    if (isCorrect) {
      score++;
    }

    showFeedback(isCorrect, question.correct, value);
    displayNextQuestionButton(() => {
      currentQuestion++;
      displayQuestion(currentQuestion);
    });

    const feedback = getFeedbackMessage(isCorrect, question.correct);
    app.appendChild(feedback);
  }

  function createAnswers(answers) {
    const answersDiv = document.createElement("div");

    answersDiv.classList.add("answers");

    for (const answer of answers) {
      const label = getAnswerElement(answer);
      answersDiv.appendChild(label);
    }

    return answersDiv;
  }
}

function getTitleElement(text) {
  const title = document.createElement("h3");
  title.innerText = text;
  return title
}

function formatId(text) {
  return text.replaceAll(" ", "-").replaceAll('"', "'").toLowerCase();
}

function getAnswerElement(text) {
  const label = document.createElement("label");
  label.innerText = text;
  const input = document.createElement("input");
  const id = formatId(text);
  input.id = id;
  label.htmlFor = id;
  input.setAttribute("type", "radio");
  input.setAttribute("name", "answer");
  input.setAttribute("value", text);
  label.appendChild(input);
  return label;
}

function getSubmitButton() {
  const submitButton = document.createElement("button");
  submitButton.innerText = "Submit";
  return submitButton;
}

// foction qui prend plusieurs paramètres, grace a ces paramètres on récupère les ID, que l'on formate grace a formatId
// puis on récupère les éléments via querySelector en foction des types, ici label, mais aussi en fonction
// des attributs, ici for et cela permet de récupérer soit l'élément qui est correct, soit l'élément sélectionné
// si l'élément sélectionné est correct, on lui ajoute la classList correct, sinon la classList incorrect
function showFeedback(isCorrect, correct, answer) {
  const correctAnswerId = formatId(correct);
  const correctElement = document.querySelector(
    `label[for="${correctAnswerId}"]`
  );

  const selectedAnswerId = formatId(answer);
  const selectedElement = document.querySelector(
    `label[for="${selectedAnswerId}"]`
  );

  correctElement.classList.add("correct");
  selectedElement.classList.add(isCorrect ? "correct" : "incorrect");
}

function getFeedbackMessage(isCorrect, correct) {
  const paragraph = document.createElement("p");
  paragraph.innerText = isCorrect
    ? "Bravo ! Tu as eu la bonne réponse"
    : `Désolé... mais la bonne réponse était ${correct}`;

  return paragraph;
}

// on créé une fonction getProgressBar, on lui passe max et value en arguments
// on va créer un élément progress que l'on affichera dans le DOM lors de l'appel de la fonction
// La méthode setAttribute(), rattachée à l'interface Element, ajoute un nouvel attribut ou change la valeur
// d'un attribut existant en utilisant la valeur fournie. Si l'attribut existe déjà, la valeur 
//est mise à jour ; sinon, un nouvel attribut est ajouté avec le nom et la valeur spécifiés.
function getProgressBar(max, value) {
  const progress = document.createElement("progress");
  progress.setAttribute("max", max);
  progress.setAttribute("value", value);
  return progress;
}

function displayNextQuestionButton(callback) {
  // on créé une variable remainingTimeout et on lui passe le timeout par défaut défini plus haut
  let remainingTimeout = TIMEOUT;

  // permet de supprimer le bouton start du quizz
  app.querySelector("button").remove();

  // fonction fléchée qui permet d'afficher dans le bouton le texte "Next" et le timeout restant
  // on divise remainingTimeout par 1000 pour avoir le temps en secondes
  const getButtonText = () => `Next (${remainingTimeout / 1000}s)`;

  // permet de créer un bouton pour passer à la question suivante
  const nextButton = document.createElement("button");
  // on appelle la fonction getButtonText pour afficher le texte voulu dans le bouton
  nextButton.innerText = getButtonText();
  // puis on l'ajoute au dom
  app.appendChild(nextButton);

  // on créé une fonction setInterval (stocké dans 1 variable), dans laquelle on vient retirer 1 sec 
  // au remainingTimeout toutes les secondes
  const interval = setInterval(() => {
    remainingTimeout -= 1000;
    nextButton.innerText = getButtonText();
  }, 1000);

  // on crée une fonction setTimeout qui vient s'éxecuter si on n'a pas cliqué sur le bouton à l'issue 
  // du temps imparti. une fois que TIMEOUT est passé, on envoie handleNextQuestion
  const timeout = setTimeout(() => {
    handleNextQuestion();
  }, TIMEOUT);


  const handleNextQuestion = () => {
    clearInterval(interval);
    clearTimeout(timeout);
    callback();
  };

  // si l'utilisateur clique sur le bouton nextButton (sans attendre le timeout), 
  // cela va passer à la question suivante
  nextButton.addEventListener("click", () => {
    handleNextQuestion();
  });
}

// cette fonction nous permets, une fois que l'on a cliqué sur le bouton submit, de ne plus pouvoir 
// séléctionner une réponse
function disableAllAnswers() {
  const radioInputs = document.querySelectorAll('input[type="radio"]');

  for (const radio of radioInputs) {
    radio.disabled = true;
  }
}








// déconseillé:
// document.getElementById
// // -> document.querySelector("#id")
// document.getElementsByClassName
// // -> document.querySelector(".className")
// document.getElementsByTagName
// // -> document.querySelector("tagName")

// consellé:
// //document.querySelector()

/*const title = document.createElement("h1")
title.innerText = "Guigan"
const div = document.createElement("div");
div.appendChild(title)

const input = document.createElement("input");
div.appendChild(input)

app.appendChild(div);*/


// const app = document.querySelector("#app")
// const startButton = document.querySelector("#start");

// let i = 0;

// startButton.addEventListener("click", () => {
//   const question = document.querySelector("#question") ?? document.createElement("p");
//   // on crée une variable question qui, si elle existe déja, affiche l'élément question, sinon on créé un nouvel élément question
//   question.id = "question";  // puis on lui ajoute un id (si c'est pas déja le cas)
//   question.innerText = Questions[i].question; // ici on ajoute l'innerText pioché dans la liste des questions
//   app.insertBefore(question, startButton);// puis on l'insère (la question, le paragraphe) avant le bouton start

//   i++;
//   if (i > Questions.length - 1 ) {
//     i = 0
//   }
// });
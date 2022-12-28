let newListValues;
let sanitizedList;
let text = "<th></th>";
let matrix = [];
let booleanMatrix = [];
let totalVotes = [];
let list = [];

let sumTotalVotes = 0;

let chooseRow;
let chooseColumn;

let lastRowChoice = 0;
let lastColumnChoice = 0;

let fifoRow; //pop[0], push[l-1];
let fifoColumn;

let totalRounds;
let idealAverage;

let sum = 0;

let choiceA_Rating;
let choiceB_Rating;
let choiceA_ExpectedScore;
let choiceB_ExpectedScore;
let choiceA_TotalVotes;
let choiceB_TotalVotes;
let choiceA_K;
let choiceB_K;

let choiceA_minus_choiceB;
let choiceB_minus_choiceA;
let percentageRemainingVotes;

let elo = [];

let form = document.getElementById("create-new-list");
function handleForm(event) { 
    event.preventDefault(); 
} 
form.addEventListener('submit', handleForm);


function sanitizeInputs(str){
    str = str.replace(/[^a-z0-9áéíóúñü \,-]/gim,"");
    return str.trim();
}

function sumArrays(array){
    sum = 0;
    for (let i = 0; i < array.length; i++){
        sum += array[i];
    }
    return sum;
}

function findK(votes, rating){
    let k;
    if ((votes <= 30) & (rating <= 6000)){
        k = 100;
    } else if ((votes >= 30) & (rating <= 6000)){
        k = 50;
    } else if ((votes >= 30) & (rating >= 6000)){
        k = 25
    };

    return k;
};




function shuffle(array){
    let flattenedArray = array.flat();
    let currentIndex = flattenedArray.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [flattenedArray[currentIndex], flattenedArray[randomIndex]] = [
        flattenedArray[randomIndex], flattenedArray[currentIndex]];
    }
  
    return flattenedArray;
}


function printMatrix(myArray){
    let result = "";

    result += '<table>'

    for (let i=0; i<(myArray.length)+1; i++) {
       result += '<colgroup></colgroup>'
    };

    result +='<tr><td><td><td>'

    for (let i=0; i<myArray.length; i++) {
        result += '<th scope="column" class="column-header">' + (i+1) + '</th>';
    };

    result += '</tr>'

    for (let i=0; i<myArray.length; i++) {
        result += "<tr>";
        result += '<th scope="row">' + list[i] + '</th><th> (' + Math.round(elo[i]) + ')</th><th scope="row">' + (i+1) + '</th>';
        for (let j=0; j<myArray[i].length; j++){
            if (booleanMatrix[i][j] === 50){
                result +=  '<td class="neutral">'
            } else if (booleanMatrix[i][j] > 50){
                result +=  '<td class="positive">' 
            } else if (booleanMatrix[i][j] < 50){
                result +=  '<td class="negative">' 
            }
            result += Math.round(booleanMatrix[i][j]) + '%<span class="tooltiptext">' + myArray[i][j] + ' (' + booleanMatrix[i][j] + "%)</span></td>";
        }
        result += "</tr>";
    };



    result += "</table>"
    return result;
}

function createNewList(){
    newListValues = document.getElementById("write-new-list").value;
    sanitizedList = sanitizeInputs(newListValues);
    list = sanitizedList.split(",");

    fifoRow = Array((list.length) - 2);
    fifoColumn = Array((list.length) - 2);

    totalRounds = ((list.length) * (list.length)) - (list.length);
    idealAverage = 1 / totalRounds;


    console.log(totalRounds);
    console.log((idealAverage)*100 + "%");


    document.getElementById("exercise").style.display = "block";
    document.getElementById("info").style.display = "none";

    //Create table rows, 1 for each list item + 1 for the labels
    for (let i=0; i<list.length; i++) {
        matrix[i] = [];
        booleanMatrix[i] = []
        totalVotes[i] = []
        elo[i] = 1000;
        for (let j=0; j < list.length; j++){
            matrix[i][j] = list[i] + " v. " + list[j];
            booleanMatrix[i][j] = 50;
            totalVotes[i][j] = 0;
        }
      };

    //Create an equal amount of columns.
    //Black out the corners
    document.getElementById("list-item-matrix").innerHTML = printMatrix(matrix);
    document.getElementById("votes-needed").innerHTML = '<p class="not-ready">Votes Needed (Recommended): ' + sumTotalVotes + '/' + (list.length - 1)*15 + '</p>';
    giveChoice();
};

function giveChoice(){
    let question = document.getElementById("question").value;
    let sanitizedQuestion = sanitizeInputs(question);

    // Drawing criteria:
    // 1. The two choices have to be unique (x cannot be compared to x)
    // 2. Of the two choices, one must not have been drawn in the prior round. (if the last round was between x & y, then this round cannot have both x or y as choices. It must be one or the other. )
    // 3. The pair must have been chosen less than frequently.

    do{
        do {
            chooseRow = Math.floor(Math.random() * list.length);
        } while (/* fifoRow.includes(chooseRow) */ chooseRow == lastRowChoice);


        do {
            chooseColumn =  Math.floor(Math.random() * list.length);
        } while (/* fifoRow.includes(chooseColumn) */ (chooseColumn == lastColumnChoice) || (chooseColumn == chooseRow));

    } while ((totalVotes[chooseColumn][chooseRow])/(sumTotalVotes*2) > idealAverage);


    lastRowChoice = chooseRow;
    lastColumnChoice = chooseColumn;

/* 
    fifoRow.shift();
    fifoRow.push(chooseRow);

    fifoRow.shift();
    fifoRow.push(chooseColumn); */

    console.log(fifoRow);



    document.getElementById("choices").innerHTML = '<h2>' + sanitizedQuestion + '?</h2>';
    document.getElementById("choices").innerHTML += '<div class="buttons-to-press"><input type="button" class="choice-button" onclick="option(' + chooseRow +', ' + chooseColumn +')" name="option1" id="option1" value="' + list[chooseRow] + '">' + '<input type="button" class="choice-button" onclick="option(' + chooseColumn +', ' + chooseRow +')"" name="option2" id="option2" value="' + list[chooseColumn] + '"></div>';


    choiceA_Rating = elo[chooseRow];
    choiceB_Rating = elo[chooseColumn];

    let x = choiceA_Rating - choiceB_Rating;
    let y = choiceB_Rating - choiceA_Rating;

    choiceA_TotalVotes = sumArrays(totalVotes[chooseRow]);
    choiceB_TotalVotes = sumArrays(totalVotes[chooseColumn]);

    //Expected Score

    choiceA_ExpectedScore = 1/(1+10**((y)/1000));
    choiceB_ExpectedScore = 1/(1+10**((x)/1000));

    choiceA_K = findK(choiceA_TotalVotes, choiceA_Rating);
    choiceB_K = findK(choiceB_TotalVotes, choiceB_Rating);

}


function option(chosen, rejected){


    



    //Calculating ELO: 
    // Step 1: Find the Expected Score
    // E(a) = 1 / 1 + 10 ^ ((Rating(b) - Rating(a))/400)
    // E(b) = 1 / 1 + 10 ^ ((Rating(a) - Rating(b))/400)

    // Step 2: Determine K-Factor
    // if ((totalVotes < 30) || (rating < 2400){ K = 40 };
    // if ((totalVotes > 30) || (rating < 2400){ K = 20 };
    // if ((totalVotes > 30) || (rating > 2400){ K = 10 };

    // Step 3: Play the game and get an outcome

    // Step 4: Based on the outcome (if "a" wins and "b" loses):
    // Rating(a) + K(1-E(a))
    // Rating(b) + K(0-E(b))


    if (elo[chooseRow] == elo[chosen]){
        elo[chosen] = choiceA_Rating + choiceA_K * (1 - choiceA_ExpectedScore);
        elo[rejected] = choiceB_Rating + choiceB_K * (0 - choiceB_ExpectedScore);
        if (elo[rejected]<= 0){
            elo[rejected] = 0;
        }
    } 

    if (elo[chooseColumn] == elo[chosen]){
        elo[chosen] = choiceB_Rating + choiceB_K * (1 - choiceB_ExpectedScore);
        elo[rejected] = choiceA_Rating + choiceA_K * (0 - choiceA_ExpectedScore);
        if (elo[rejected]<= 0){
            elo[rejected] = 0;
        }
    } 

    let x = elo[chosen] - elo[rejected];
    let y = elo[rejected] - elo[chosen];

    let chosenChance = 1/(1+10**((y)/1000));
    let rejectedChance = 1/(1+10**((x)/1000));

    booleanMatrix[chosen][rejected] = (chosenChance * 100).toFixed(2); //Updated Changed
    booleanMatrix[rejected][chosen] = (rejectedChance * 100).toFixed(2); //Updated Chances

    totalVotes[chosen][rejected] += 1;
    totalVotes[rejected][chosen] += 1;

    sumTotalVotes += 1;
    
    percentageRemainingVotes = sumTotalVotes / ((list.length - 1)*15);


    if (percentageRemainingVotes <= .499){
        document.getElementById("votes-needed").innerHTML = '<p class="not-ready">Votes Needed (Recommended): ' + sumTotalVotes + '/' + (list.length - 1)*15 + '</p>';
    } else if ((percentageRemainingVotes >= .499) & (percentageRemainingVotes <= .999)){
        document.getElementById("votes-needed").innerHTML = '<p class="almost-ready">Votes Needed (Recommended): ' + sumTotalVotes + '/' + (list.length - 1)*15 + '</p>';
    } else if (percentageRemainingVotes >= .999){
        document.getElementById("votes-needed").innerHTML = '<p class="ready">Votes Needed (Recommended): ' + sumTotalVotes + '/' + (list.length - 1)*15 + '</p>';
    }



    giveChoice();
    document.getElementById("list-item-matrix").innerHTML = printMatrix(matrix);

/* 
    document.getElementById("results-list").innerHTML = " "

    for (let i=0; i<list.length; i++) {
        document.getElementById("results-list").innerHTML += '<li><b>' + list[i] + ': </b>' + Math.round(elo[i]) +'</li>';
    }; */

};
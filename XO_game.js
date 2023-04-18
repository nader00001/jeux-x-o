function init(player, OPPONENT){
    // bech nekhdmou bel canvs comme 2 d
    const canvas = document.getElementById("cvs");
    const ctx = canvas.getContext("2d");

    // BOARD VARIABLES
    let board = [];  //tableau 
    const COLUMN = 3;  // nmbre de colonnes 
    const ROW = 3;     // nbre de lignes
    const SPACE_SIZE = 150;  // avec pixel

    // STORE PLAYER'S MOVES
    let gameData = new Array(9);
    
    // By default the first player to play is the human
    let currentPlayer = player.man;

    // load X & O images
    const xImage = new Image();
    xImage.src = "img/X.png";

    const oImage = new Image();
    oImage.src = "img/O.png";

    // combinaisons kifeh ynajem yerbeh joueur 
    const COMBOS = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    // par defaut game over a false 
    let GAME_OVER = false;
    
    // bech torsem tableau avec nmbre de row et colonnes w kol case aandha taille en pixel
    function drawBoard(){

        // kol wahda aandha id
        let id = 0
        for(let i = 0; i < ROW; i++){
            board[i] = [];
            for(let j = 0; j < COLUMN; j++){
                board[i][j] = id;
                id++;

                // draw the spaces
                ctx.strokeStyle = "#000";
                // torsem kol case de i et j w toul w 3oredh avec sapce_size
                ctx.strokeRect(j * SPACE_SIZE, i * SPACE_SIZE, SPACE_SIZE, SPACE_SIZE);
            }
        }
    }
    drawBoard();

    // ON PLAYER'S CLICK
    canvas.addEventListener("click", function(event){
        
        // IF IT's A GAME OVER? EXIT
        if(GAME_OVER) return;

        // X & Y position of mouse click relative to the canvas
        let X = event.clientX - canvas.getBoundingClientRect().x;
        let Y = event.clientY - canvas.getBoundingClientRect().y;

        // WE CALCULATE i & j of the clicked SPACE
        let i = Math.floor(Y/SPACE_SIZE);
        let j = Math.floor(X/SPACE_SIZE);

        // Get the id of the space the player clicked on
        let id = board[i][j];

        // Prevent the player to play the same space twice
        if(gameData[id]) return;

        // store the player's move to gameData
        gameData[id] = currentPlayer;
        
        // draw the move on board
        drawOnBoard(currentPlayer, i, j);

        // Check if the play wins
        if(isWinner(gameData, currentPlayer)){
            showGameOver(currentPlayer);
            GAME_OVER = true;
            return;
        }

        // check if it's a tie game
        if(isTie(gameData)){
            showGameOver("tie");
            GAME_OVER = true;
            return;
        }

        if( OPPONENT == "computer"){
            // get id of space using minimax algorithm
            let id = minimax( gameData, player.computer ).id;

            // store the player's move to gameData
            gameData[id] = player.computer;
            
            // get i and j of space
            let space = getIJ(id);

            // draw the move on board
            drawOnBoard(player.computer, space.i, space.j);

            // Check if the play wins
            if(isWinner(gameData, player.computer)){
                showGameOver(player.computer);
                GAME_OVER = true;
                return;
            }

            // check if it's a tie game
            if(isTie(gameData)){
                showGameOver("tie");
                GAME_OVER = true;
                return;
            }
        }else{
            // GIVE TURN TO THE OTHER PLAYER
            currentPlayer = currentPlayer == player.man ? player.friend : player.man;
        }

    });

    // MINIMAX , c'est un algorithme de recherche de decision pour trouver la meilleur strategie , Il parcourt de manière récursive l'arbre de jeu pour évaluer chaque mouvement possible et trouver le meilleur mouvement pour le joueur en question.
    function minimax(gameData, PLAYER){
        // BASE
        if( isWinner(gameData, player.computer) ) return { evaluation : +10 };
        if( isWinner(gameData, player.man)      ) return { evaluation : -10 };
        if( isTie(gameData)                     ) return { evaluation : 0 };

        // LOOK FOR EMTY SPACES
        let EMPTY_SPACES = getEmptySpaces(gameData);

        // SAVE ALL MOVES AND THEIR EVALUATIONS
        let moves = [];

        // LOOP OVER THE EMPTY SPACES TO EVALUATE THEM
        for( let i = 0; i < EMPTY_SPACES.length; i++){
            // GET THE ID OF THE EMPTY SPACE
            let id = EMPTY_SPACES[i];

            // BACK UP THE SPACE
            let backup = gameData[id];

            // MAKE THE MOVE FOR THE PLAYER
            gameData[id] = PLAYER;

            // SAVE THE MOVE'S ID AND EVALUATION
            let move = {};
            move.id = id;
            // THE MOVE EVALUATION
            if( PLAYER == player.computer){
                move.evaluation = minimax(gameData, player.man).evaluation;
            }else{
                move.evaluation = minimax(gameData, player.computer).evaluation;
            }

            // RESTORE SPACE
            gameData[id] = backup;

            // SAVE MOVE TO MOVES ARRAY
            moves.push(move);
        }

        // MINIMAX ALGORITHM
        let bestMove;

        if(PLAYER == player.computer){
            // MAXIMIZER
            let bestEvaluation = -Infinity;
            for(let i = 0; i < moves.length; i++){
                if( moves[i].evaluation > bestEvaluation ){
                    bestEvaluation = moves[i].evaluation;
                    bestMove = moves[i];
                }
            }
        }else{
            // MINIMIZER
            let bestEvaluation = +Infinity;
            for(let i = 0; i < moves.length; i++){
                if( moves[i].evaluation < bestEvaluation ){
                    bestEvaluation = moves[i].evaluation;
                    bestMove = moves[i];
                }
            }
        }

        return bestMove;
    }

    // GET EMPTY SPACES // traje3lk les cases elli ferghin mn tableau // utulisation de errow function
    const getEmptySpaces = (gameData) => {
        let EMPTY = [];
      
        for (let id = 0; id < gameData.length; id++) {
          if (!gameData[id]) EMPTY.push(id);
        }
      
        return EMPTY;
      }
      
    // GET i AND j of a SPACE /// trouver les indices de la case à partir de son identifiant (id). et retourne un objet {i , j}
    function getIJ(id){
        for(let i = 0; i < board.length; i++){
            for(let j = 0; j < board[i].length; j++){
                if(board[i][j] == id) return { i : i, j : j}
            }
        }
    }

    // check for a winner // tchouf chkoun elli rbeh 
    function isWinner(gameData, player){
        for(let i = 0; i < COMBOS.length; i++){
            let won = true;

            for(let j = 0; j < COMBOS[i].length; j++){
                let id = COMBOS[i][j];
                won = gameData[id] == player && won;
            }

            if(won){
                return true;
            }
        }
        return false;
    }

    // Check for a tie game // vérifie si le plateau de jeu est rempli et s'il n'y a pas de gagnant, auquel cas elle renvoie true, sinon elle renvoie false.
    function isTie(gameData){
        let isBoardFill = true;
        for(let i = 0; i < gameData.length; i++){
            isBoardFill = gameData[i] && isBoardFill;
        }
        if(isBoardFill){
            return true;
        }
        return false;
    }

    // SHOW GAME OVER // affiche un message de fin de partie en fonction de joueur gagnant 
    function showGameOver(player){
        let message = player == "tie" ? "Oops No Winner" : "le gagnant est:";
        let imgSrc = `img/${player}.png`;

        gameOverElement.innerHTML = `
            <h1>${message}</1>
            <img class="winner-img" src=${imgSrc} </img>
            <div class="play" onclick="location.reload()">Joueur autre fois!</div>
        `;

        gameOverElement.classList.remove("hide");
    }

    // dessine une image représentant le joueur en train de jouer (X ou O) dans la case cliquée par le joueur sur le canevas.
    function drawOnBoard(player, i, j){
        let img = player == "X" ? xImage : oImage;

        // the x,y positon of the image are the x,y of the clicked space
        ctx.drawImage(img, j * SPACE_SIZE, i * SPACE_SIZE);
    }
}




/////////


// SELECT START ELEMENT
const options = document.querySelector(".options");

// SELECT BUTTONS
const computerBtn = document.querySelector(".computer");
const friendBtn = document.querySelector(".friend");
const xBtn = document.querySelector(".x");
const oBtn = document.querySelector(".o");
const playBtn = document.querySelector(".play");

// GAME OVER ELEMENT
const gameOverElement = document.querySelector(".gameover");

const player = new Object;
let OPPONENT;

oBtn.addEventListener("click", function(){
    player.man = "O";
    player.computer = "X";
    player.friend = "X";

    switchActive(xBtn, oBtn); //  changer la classe CSS active des boutons, afin d'indiquer visuellement l'option sélectionnée.
});

xBtn.addEventListener("click", function(){
    player.man = "X";
    player.computer = "O";
    player.friend = "O";

    switchActive(oBtn, xBtn);
});
 
computerBtn.addEventListener("click", function(){
    OPPONENT = "computer";
    switchActive(friendBtn, computerBtn);
});

friendBtn.addEventListener("click", function(){
    OPPONENT = "friend";
    switchActive(computerBtn, friendBtn);
});

playBtn.addEventListener("click", function(){
    if( !OPPONENT){
        computerBtn.style.backgroundColor = "red"; // kan ma khtartech l opponent twalli bel ahmer 
        friendBtn.style.backgroundColor = "red"; // //  //  //
        return;
    }

    if( !player.man ){
        oBtn.style.backgroundColor = "red"; // kan ma khtartech player 
        xBtn.style.backgroundColor = "red";
        return;
    }
    
    init(player, OPPONENT);   // initialisation de jeu avec player et opponent
    options.classList.add("hide");
});
// changer la classe CSS active des boutons, afin d'indiquer visuellement l'option sélectionnée.
function switchActive(off, on){ 
    off.classList.remove("active");
    on.classList.add("active");
}

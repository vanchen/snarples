// Functions used with Interface Components
var checkIfTurn = function(match) {
  for (var i =0; i < match.players.length; i++) {
    if (match.players[i].userId == Meteor.user()._id) {
      return match.players[i].turn
    }
  }
}

var updateBids = function(match,bid) {
  players = match.players;
  for (var i =0; i < players.length; i++) {
    if (players[i].userId == Meteor.user()._id) {
      players[i].currentBid = bid;
      players[i].turn = false;
      if (i == players.length -1) {
        players[0].turn = true
      }
      else {
        players[i+1].turn = true
      }
    }
  }
  Matches.update(match._id, {
    $set : {players: players}
  });
}

var getCard = function(matchId) {
  var match = Matches.findOne(matchId);
  var cards = match.cards;
  var usedCards = match.usedCards;
  var randomIndex = Math.floor( Math.random() * cards.length );
  var card = cards[randomIndex];
  usedCards.push(card);
  cards.splice(randomIndex,1);
  Matches.update(matchId,{
                  $set : {cards: cards, usedCards: usedCards}
                });
  return card;
}

var dealCards = function(matchId,players) {
  for (var j=0; j < 5; j++) {
    for (var i=0; i < players.length; i++) {
      players[i].cards.push(getCard(matchId))
    }
  }
  var playersArray = players;
  console.log(playersArray[0])
  Matches.update(matchId,{$set : {players: playersArray}});
  Matches.update(matchId,{$set : {cardsDealt: true}});
}


var calculateTrick = function(matchId) {
  var fieldCards = Matches.findOne(matchId).fieldCards;
  var cards = [];
  var counter = 0;
  var winner = fieldCards[0].owner
  do {
    counter = 0;
    for (var i =0; i < fieldCards.length -1; i++) {
      if (fieldCards[i].card.number < fieldCards[i+1].card.number) {
        var tmp = fieldCards[i];
        fieldCards[i] = fieldCards[i+1]
        fieldCards[i+1] = tmp;
        counter += 1;
      }
    }
  }
  while (counter > 0);

  for (var i=0; i < fieldCards.length; i++) {
    if (fieldCards[i].card.suit == Matches.findOne(matchId).trump) {
      winner = fieldCards[i].owner;
      break
    }
  }

  var players = Matches.findOne(matchId).players;

  for (var i=0; i < players.length; i++ ) {
    if (players[i].userId == winner) {
      players[i].currentTrick += 1;
    }
  }

  Matches.update(matchId, {
    $set : {count: 0, fieldCards: [],players: players}
  });

}

Arena = React.createClass({

  mixins: [ReactMeteorData],
  getMeteorData() {
    var match = Matches.findOne(this.props.matchId);
    return {
      match: match,
      user: Meteor.user()
    }
  },

  renderFieldCards() {
    var match = this.data.match;
    var fieldCards = match.fieldCards;
    return fieldCards.map((card) => {
      var imageSource = "/" + card.card.image;
      console.log(imageSource);
      return   <Col xs={2} className= "thumbnail">
          <img className="responsive" src={imageSource}/> </Col>
    });
  },

  makeBid() {
    var match = this.data.match;
    if (match.round ==0 && match.cardsDealt == true) {
      if (userTurn) {
        var bid = prompt("Enter your bid (1-5):")
        updateBids(match,bid)
      }
    }
  },

  playCard(e) {
    e.preventDefault();
    var cardId = e.currentTarget.id;
    var players = this.data.match.players;
    var fieldCards = this.data.match.fieldCards;
    for (var i=0; i < players.length; i++) {
      if (players[i].userId == this.data.user._id) {
        for (var j=0; j < players[i].cards.length; j++) {
          if (players[i].cards[j]._id == cardId) {
            fieldCards.push({card: players[i].cards[j], owner: Meteor.user()._id})
            players[i].cards.splice(j,1)
            players[i]
            console.log(players[i].cards[j])
            break
          }
        }
      }
    }
    Matches.update(this.data.match._id, {
      $set : {players: players, fieldCards: fieldCards}
    });
    Matches.update(this.data.match._id, {
      $inc : {count: 1}
    });
  },

  renderUserCards() {
    var cStyle = {width: '12%'}
    var players = this.data.match.players
    var userCards = [];
    for (var i=0; i < players.length; i++) {
      if (players[i].userId == this.data.user._id) {
        userCards = players[i].cards
        userTurn = players[i].turn
        break
      }
    }
    return userCards.map((card) => {
      return   <Col xs={2} className= "thumbnail" style={cStyle}>
          <img onClick={this.playCard} id={card._id} className="responsive" src={card.image}/> </Col>
    });
  },

  renderBidBoxes() {
    var match = this.data.match;
    var bids = 0;
    for (var i=0; i < match.players.length; i++) {
      if (match.players[i].userId == Meteor.user()._id) {
        bids = match.players[i].currentBid;
      }
    }
    var bidArray = [{size:10, background: 'white'},{size: 26, background: 'white'},{size:42,background: 'white'},{size:58,background: 'white'},{size:74,background: 'white'}];
    for (var i=0; i < bids; i++) {
      bidArray[i].background = 'black';
    }
    return bidArray.map((key) => {
      var left = String(key.size) + '%';
      var bidBoxStyle = {position: 'absolute', width: '15%', height: '15%', top: '80%', left: left, background: key.background}
      return <div className= "thumbnail" style={bidBoxStyle}></div>
      });
    },

  render() {
    // Write Game Logic Here

    var match = this.data.match
    var userTurn = checkIfTurn(match);

    if (match.round == 0 && match.cardsDealt == false) {
      dealCards(match._id, match.players)
      console.log('first_render')
    }


    if (match.count == match.players.length) {
      calculateTrick(match._id)
    }






    const playingStyle = {position: 'absolute', width: '40%', height: '40%',top: '42%',left: '27%'};
    // Some Component Styles
    const profileStyle =  {position: 'absolute', width: '15%', height: '92%',left: '4%'};
    const userStyle = {position: 'absolute', width: '100%', height: '30%',top: '70%',left: '0'};
    const scoreStyle = {position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)'}
    const trumpStyle = {position: 'absolute', width: '50%', top: '30%', left: '25%'}
    const trumpCard = {position: 'absolute', left: '81%', height: '92%', width: '15%'}
    const cardsStyle = {position: 'absolute', left: '22%', width:'75%'}
    const player3 = {position: 'absolute', top: '18%', left: '47%', width: '10%', height: '20%', transform: 'translate(-50%, -50%)'}


    return (
    <Grid fluid={true}>
      <div className="playing-field" style={playingStyle}>
        <Row>
          <Col xs={1}> </Col>
            {this.renderFieldCards()}
          <Col xs={1} ></Col>
        </Row>
      </div>
      <div className="panel panel-success" style={player3}>
        <div className="panel-heading"> </div>
        <h1 style={scoreStyle}> 20 </h1>
        {this.renderBidBoxes()}
      </div>
      <div style={userStyle}>
        <div className="user-profile panel panel-info" style={profileStyle}>
          <div className="panel-heading">
          </div>
          <h1 style={scoreStyle}> 20 </h1>
            {this.renderBidBoxes()}
        </div>
        <div className="panel panel-info"  style={trumpCard}>
          <div className="panel-heading"> </div>
          <img src='spade.png' className="responsive trump-style" style={trumpStyle}/>
        </div>
        <div className="row" style={cardsStyle}>
          <Col xs={1}> </Col>
          {this.renderUserCards()}
          <Col xs={1} ></Col>
        </div>
      </div>
    </Grid>
    )
  }
});






Player1 = React.createClass({
  render() {
    return(
      <div className="player-1 panel panel-success">
        <div className="panel-heading"> </div>
        <h1 className="score"> 15 </h1>
        <div className="bid-box-1 thumbnail"> </div>
        <div className="bid-box-2 thumbnail"> </div>
        <div className="bid-box-3 thumbnail"> </div>
        <div className="bid-box-4 thumbnail"> </div>
        <div className="bid-box-5 thumbnail"> </div>
      </div>
    )
  }
});


Player2 = React.createClass({
  render() {
    return(
      <div className="player-2 panel panel-danger">
        <div className="panel-heading"> </div>
        <h1 className="score"> 16 </h1>
        <div className="bid-box-1 thumbnail"> </div>
        <div className="bid-box-2 thumbnail"> </div>
        <div className="bid-box-3 thumbnail"> </div>
        <div className="bid-box-4 thumbnail"> </div>
        <div className="bid-box-5 thumbnail"> </div>
      </div>
    )
  }
});

Player3 = React.createClass({
  render() {
    return(
      <div className="player-3 panel panel-success">
        <div className="panel-heading"> </div>
        <h1 className="score"> 20 </h1>
        <div className="bid-box-1 thumbnail"> </div>
        <div className="bid-box-2 thumbnail"> </div>
        <div className="bid-box-3 thumbnail"> </div>
        <div className="bid-box-4 thumbnail"> </div>
        <div className="bid-box-5 thumbnail"> </div>
      </div>
    )
  }
});

Player4 = React.createClass({
  render() {
    return(
      <div className="player-4 panel panel-danger">
        <div className="panel-heading"> </div>
        <h1 className="score"> 5 </h1>
        <div className="bid-box-1 thumbnail"> </div>
        <div className="bid-box-2 thumbnail"> </div>
        <div className="bid-box-3 thumbnail"> </div>
        <div className="bid-box-4 thumbnail"> </div>
        <div className="bid-box-5 thumbnail"> </div>
      </div>
    )
  }
});

Player5 = React.createClass({
  render() {
    return(
          <div className="player-5 panel panel-danger">
              <div className="panel-heading"> </div>
              <h1 className="score"> 3 </h1>
              <div className="bid-box-1 thumbnail"> </div>
              <div className="bid-box-2 thumbnail"> </div>
              <div className="bid-box-3 thumbnail"> </div>
              <div className="bid-box-4 thumbnail"> </div>
              <div className="bid-box-5 thumbnail"> </div>
            </div>
    )
  }
});

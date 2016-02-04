// COMPONENT STYLING
const playingStyle = {position: 'absolute', width: '40%', height: '40%',top: '42%',left: '27%'};
const userStyle = {position: 'absolute', width: '100%', height: '30%',top: '70%',left: '0'};
const scoreStyle = {position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)'}
const trumpStyle = {position: 'absolute', width: '50%', top: '30%', left: '25%'}
const trumpCard = {position: 'absolute', left: '81%', height: '92%', width: '15%'}
const cardsStyle = {position: 'absolute', left: '22%', width:'75%'}


Arena = React.createClass({

  mixins: [ReactMeteorData],

  getMeteorData() {
    var match = Matches.findOne(this.props.matchId);
    return {
      match: match,
      user: Meteor.user()
    }
  },

  /////////////////////////
      /* GAME LOGIC */
  /////////////////////////

  playCard(e) {
    e.preventDefault();
    var cardId = e.currentTarget.id;
    var match = this.data.match
    var pi = getPlayerIndex(match,Meteor.user()._id)
    if (match.players[pi].turn && match.players[pi].bidMade == true) {

      for (var j=0; j < match.players[pi].cards.length; j++) {
        if (match.players[pi].cards[j]._id == cardId) {
          if (match.fieldCards.length == 0) {
            match.fieldCards.push({card: match.players[pi].cards[j], owner: Meteor.user()._id, leadCard: true})
            match.players[pi].cards.splice(j,1)
            break
          }
          else {
            match.fieldCards.push({card: match.players[pi].cards[j], owner: Meteor.user()._id, leadCard: false})
            match.players[pi].cards.splice(j,1)
            break
          }
        }
      }

      match = changeTurn(match);
      Matches.update(match._id, {
        $set : {players: match.players, fieldCards: match.fieldCards},
        $inc : {cardsPlayed: 1}
      });
    }
  },
  bidOne() {
    var match = this.data.match
    console.log("test")
    var index = getPlayerIndex(match,Meteor.user()._id);
    match.players[index].currentBid = 1;
    match.players[index].bidMade = true;
    match = changeTurn(match)
    Matches.update(match._id,{
      $set: {players: match.players}
    });
  },
  bidTwo() {
    var match = this.data.match
    var index = getPlayerIndex(match,Meteor.user()._id);
    match.players[index].currentBid = 2;
    match.players[index].bidMade = true;
    match = changeTurn(match)
    Matches.update(match._id,{
      $set: {players: match.players}
    });
  },
  bidThree() {
    var match = this.data.match
    var index = getPlayerIndex(match,Meteor.user()._id);
    match.players[index].currentBid = 3;
    match.players[index].bidMade = true;
    match = changeTurn(match)
    Matches.update(match._id,{
      $set: {players: match.players}
    });
  },
  bidFour() {
    var match = this.data.match
    var index = getPlayerIndex(match,Meteor.user()._id);
    match.players[index].currentBid = 4;
    match.players[index].bidMade = true;
    match = changeTurn(match)
    Matches.update(match._id,{
      $set: {players: match.players}
    });
  },
  bidFive() {
    var match = this.data.match
    var index = getPlayerIndex(match,Meteor.user()._id);
    match.players[index].currentBid = 5;
    match.players[index].bidMade = true;
    match = changeTurn(match)
    Matches.update(match._id,{
      $set: {players: match.players}
    });
  },
  pickSpades() {
    var match = this.data.match
    var index = getPlayerIndex(match,Meteor.user()._id);
    match.players[index].pickTrump = false;
    Matches.update(match._id,{
      $set : {trump: 'spades', players: match.players}
    });
  },

  pickHearts() {
    var match = this.data.match
    var index = getPlayerIndex(match,Meteor.user()._id);
    match.players[index].pickTrump = false;
    Matches.update(match._id,{
      $set : {trump: 'hearts', players: match.players}
    });
  },
  pickDiamonds() {
    var match = this.data.match
    var index = getPlayerIndex(match,Meteor.user()._id);
    match.players[index].pickTrump = false;
    Matches.update(match._id,{
      $set : {trump: 'diamonds', players: match.players}
    });
  },
  pickClubs() {
    var match = this.data.match
    var index = getPlayerIndex(match,Meteor.user()._id);
    match.players[index].pickTrump = false;
    Matches.update(match._id,{
      $set : {trump: 'clubs', players: match.players}
    });
  },

  /////////////////////////
    /* STYLE METHODS */
  /////////////////////////


  profileStyle() {
    var match = this.data.match
    var index = getPlayerIndex(match,Meteor.user()._id)
    if (match.players[index].turn) {
      return {position: 'absolute', width: '15%', height: '92%',left: '4%', background: 'black'}
    }
    else {
      return {position: 'absolute', width: '15%', height: '92%',left: '4%', background: 'white'}
    }
  },

  player3() {
    var match = this.data.match
    var index = getPlayerIndex(match,Meteor.user()._id)
    if (match.players[index].turn) {
      return {position: 'absolute', top: '18%', left: '47%', width: '10%', height: '20%', transform: 'translate(-50%, -50%)', background: 'white'}
    }
    else {
      return {position: 'absolute', top: '18%', left: '47%', width: '10%', height: '20%', transform: 'translate(-50%, -50%)', background: 'black'}
    }
  },


  /////////////////////////
    /* RENDER METHODS */
  /////////////////////////

  renderMakeChoice() {
    const makeBid = {position: 'absolute',height:'30%',width:'40%',top:'32%',left:'27%'}
    const bidBox1 =  {position: 'absolute',height:'48%',width:'18%',top:'30%',left:'1%'}
    const bidBox2 =  {position: 'absolute',height:'48%',width:'18%',top:'30%',left:'21%'}
    const bidBox3 =  {position: 'absolute',height:'48%',width:'18%',top:'30%',left:'41%'}
    const bidBox4 =  {position: 'absolute',height:'48%',width:'18%',top:'30%',left:'61%'}
    const bidBox5 =  {position: 'absolute',height:'48%',width:'18%',top:'30%',left:'81%'}

    const trumpBox1 =  {position: 'absolute',height:'48%',width:'18%',top:'30%',left:'11%'}
    const trumpBox2 =  {position: 'absolute',height:'48%',width:'18%',top:'30%',left:'32%'}
    const trumpBox3 =  {position: 'absolute',height:'48%',width:'18%',top:'30%',left:'53%'}
    const trumpBox4 =  {position: 'absolute',height:'48%',width:'18%',top:'30%',left:'74%'}

    var match = this.data.match;
    var index = getPlayerIndex(match,Meteor.user()._id)


    if (match.cardsDealt == true && match.players[index].bidMade == false && match.players[index].turn == true) {
      return  (<div className="panel panel-info" style={makeBid}>
              <div className="panel-heading"> Make Your Bid: </div>
              <div className="panel-body">
                <div className="thumbnail bidBox1" onClick={this.bidOne} style={bidBox1}> <h3 className="text-center"> 1 </h3></div>
                <div className="thumbnail bidBox2" onClick={this.bidTwo} style={bidBox2}> <h3 className="text-center"> 2 </h3></div>
                <div className="thumbnail bidBox3" onClick = {this.bidThree} style={bidBox3}> <h3 className="text-center"> 3 </h3></div>
                <div className="thumbnail bidBox4" onClick = {this.bidFour} style={bidBox4}> <h3 className="text-center"> 4 </h3></div>
                <div className="thumbnail bidBox5"  onClick = {this.bidFive} style={bidBox5}> <h3 className="text-center"> 5 </h3></div>
              </div>
            </div>)
    }

    if (match.cardsDealt == true && match.players[index].bidMade == true && match.players[index].pickTrump == true) {
      return  (<div className="panel panel-info" style={makeBid}>
              <div className="panel-heading"> Pick Trump: </div>
              <div className="panel-body">
                <div className="thumbnail bidBox1" onClick={this.pickSpades} style={trumpBox1}> <img src="spade.png"/> </div>
                <div className="thumbnail bidBox2" onClick={this.pickHearts} style={trumpBox2}> <img src="hearts.jpg"/> </div>
                <div className="thumbnail bidBox3" onClick = {this.pickClubs} style={trumpBox3}> <img src="clubs.png"/> </div>
                <div className="thumbnail bidBox4" onClick = {this.pickDiamonds} style={trumpBox4}> <img src="diamonds.png"/> </div>
              </div>
            </div>)



    }
  },

  renderPlayerScore() {
    var match = this.data.match;
    var players = match.players;
    var index = getPlayerIndex(match,Meteor.user()._id)
    for (var i=0; i < players.length; i++) {
      if (i != index) {
        return players[i].score
      }
    }
  },

  renderUserScore() {
    var match = this.data.match
    var index = getPlayerIndex(match,Meteor.user()._id);
    return match.players[index].score
  },


  renderFieldCards() {
    var match = this.data.match;
    var fieldCards = match.fieldCards;
    return fieldCards.map((card) => {
      var imageSource = "/" + card.card.image;
      return   <Col xs={2} className= "thumbnail">
            <img className="responsive" src={imageSource}/> </Col>
      });
    },


  renderUserCards() {
    // NOT WORKING: NEED TO FIX

    var cStyle = {width: '12%'}
    var cStyleDisabled = {width: '12%', opacity:'50%'}
    var players = this.data.match.players
    var userCards = [];
    for (var i=0; i < players.length; i++) {
      if (players[i].userId == this.data.user._id) {
        userCards = players[i].cards
        userTurn = players[i].turn
        break
      }
    }
    if (this.data.match.fieldCards.length != 0) {
      var leadCard = getLeadCard(this.data.match);
      var count = 0;
      for (var i=0; i < userCards.length; i++) {
        console.log(count)
        if (userCards[i].suit == leadCard.suit){
          count += 1
          console.log(count)
        }
      }
    }

    if (count == 0 || this.data.match.fieldCards.length == 0) {
      return userCards.map((card) => {
        return   <Col xs={2} className= "thumbnail" style={cStyle}>
            <img onClick={this.playCard} id={card._id} className="responsive" src={card.image}/> </Col>
        });
    }

    return userCards.map((card) => {
        if (leadCard.card.suit == card.suit) {
          return   <Col xs={2} className= "thumbnail" style={cStyle}>
              <img onClick={this.playCard} id={card._id} className="responsive" src={card.image}/> </Col>
        }
        else {
          return   <Col xs={2} className= "thumbnail" style={cStyleDisabled}>
            <img id={card._id} className="responsive" src={card.image}/> </Col>
      }
    });
  },

  renderPlayerBidBoxes() {
    var match = this.data.match;
    var bids = 0;
    for (var i=0; i < match.players.length; i++) {
      if (match.players[i].userId != Meteor.user()._id) {
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

    renderTrump() {
      var match = this.data.match
      if (match.trump == 'hearts') {
        return match.trump + '.jpg'
      }
      if (match.trump == 'spades' || match.trump == 'clubs' || match.trump == 'diamonds') {
        return match.trump + '.png'
      }
    },

    renderIcons() {
      // Render Dealer Chip and Change panel styling depending on turn?
      var match = this.data.match
      var index = getPlayerIndex(match,Meteor.user()._id)
      var style = {position: 'absolute', left: '90%', width: '10%'}
      if (match.players[index].dealer) {
        return <img src='game_casino.png' style={style}/>
      }
    },



    /////////////////////////
        /* GAME FLOW */
    /////////////////////////

  render() {

    // VARIABLES
    var match = this.data.match
    var userTurn = checkIfTurn(match);
    //


    // CONTROL-FLOW #1 //
    if (!match.dealer && match.players.length == match.type) {
      var index = getPlayerIndex(match,Meteor.user()._id);

      // CONTROL-FLOW #1: DEAL ONE CARD
      if (match.players[index].cards.length == 0 && match.fieldCards.length == 0) {
        var card = getCard(match)
        match.players[index].cards.push(card.card);
        match.cards.splice(card.index,1);
        match.usedCards.push(card.card)

      }
      //

      // CONTROL-FLOW #1: PLAY CARD
      //if (userTurn) {
        if (match.usedCards.length == match.players.length) {
        match.fieldCards.push({card: match.players[index].cards[0], owner: Meteor.user()._id})
        match.players[index].cards.splice(0,1)
        //match = changeTurn(match)
        //userTurn = match.players[index].turn
        }
      //}
      //

      // CONTROL;FLOW #1: FIND HIGHEST CARD
      if (match.fieldCards.length == match.players.length) {
        match.fieldCards = cardSort(match.fieldCards)
        var dealer = match.fieldCards[0].owner
        var dealerIndex = getPlayerIndex(match,dealer)
        match.players[dealerIndex].dealer = true;
        match.fieldCards = [];
        match.cards = deckReset(match);
        match.usedCards = [];
        match.dealer = true;
        match = changeTurnLeftOfDealer(match);
      }
      //
    }
    //




    // CONTROL-FLOW #2 : RUN AFTER DEALER HAS BEEN CHOSEN //
    if (match.dealer) {
      if (match.cardsDealt == false) {
          match = dealCards(match)
        }
      if (match.cardsPlayed == match.players.length) {
        match = updateTrick(match)
      }
      if (match.round == 5) {
        match = updateScore(match);
        match = dealCards(match);
        match = resetBids(match);
        match.round = 0;
        match.trump = 'none'
      }
    if (bidsComplete(match) && match.trump == 'none') {
      match= setTrump(match);
    }
  }
    //

    // CONTROL-FLOW #3 : UPDATE MATCH //
    updateMatch(match)
    //


    /////////////////////////
        /* RENDERED */
    /////////////////////////
    return (
    <Grid fluid={true}>
      <div className="playing-field" style={playingStyle}>
        <Row>
          <Col xs={1}></Col>
          {this.renderFieldCards()}
          <Col xs={1}></Col>
        </Row>
      </div>
      {this.renderMakeChoice()}
      <div className="panel panel-success" style={this.player3()}>
        <div className="panel-heading"> </div>
        <h1 style={scoreStyle}> {this.renderPlayerScore()} </h1>
        {this.renderPlayerBidBoxes()}
      </div>
      <div style={userStyle}>
        <div className="user-profile panel panel-info" style={this.profileStyle()}>
          <div className="panel-heading"> </div>
          <h1 style={scoreStyle}> {this.renderUserScore()} </h1>
          {this.renderBidBoxes()}
          {this.renderIcons()}
        </div>
        <div className="panel panel-info"  style={trumpCard}>
          <div className="panel-heading"> </div>
          <img src={this.renderTrump()} className="responsive trump-style" style={trumpStyle}/>
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

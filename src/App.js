import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { summaryDonations } from './helpers';
import styled from 'styled-components';
import fetch from 'isomorphic-fetch';
import 'react-toastify/dist/ReactToastify.min.css';

// Start of styled setting //
const TextStyle = styled.span`
  font-family: "Trebuchet MS", Helvetica, sans-serif;
  color: #666699;
`
const PaymentText = styled.p`
font-family: "Trebuchet MS", Helvetica, sans-serif;
color: #666699;
`
const Card = styled.div`
  width: 500px;
  height: 370px;
  margin: 10px 20px 40px 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  float: left;
  display:inline-block;
  box-shadow: 5px 7px 8px #EEEEEE;

  & > img {
    width: 500px;
    height: 300px;
  }
`
const CloseBtnDiv = styled.div`
  text-align: right !important;
  padding-top: 0px !important;
  margin: 20px 25px 10px 10px !important;

  & > a{
    text-decoration: none;
    font-size: 150%;
  }
`
const Payment = styled.div`
  background-color:rgba(255, 255, 255, 0.94);
  width: 0%;
  height: inherit;
  position: absolute;
  z-index: 1;

  bottom: inherit;
  left: inherit;
  right: inherit;
  overflow: hidden;
  transition: .2s ease;

  & > div {
    margin: auto;
    text-align: center;
    padding-top: 60px;

    & > div {
      padding-bottom: 20px;
    }
  }
`
const Button = styled.button`
  background: ${props => props.primary ? 'blue' : 'white'};
  color: ${props => props.primary ? 'white' : 'blue'};

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid blue;
  border-radius: 3px;

  &:hover {
		cursor:pointer;
	}
`
const CardContainer = styled.div`
  text-align: center;
  margin: 10px auto;
  position: relative;
  width: 88%;
`
const TitleH3Convert = TextStyle.withComponent('h3')
const TitleH3 = TitleH3Convert.extend`
  padding-left: 20px;
`

const TitleMainConvert = TextStyle.withComponent('h1')
const TitleMain = TitleMainConvert.extend`
  text-align: center;
  }
`

const TotalDonationTextConvert = TextStyle.withComponent('h4')
const TotalDonationText = TotalDonationTextConvert.extend`
  text-align: center;
  }
`
// End of styled setting //

export default connect((state) => state)(
  class App extends Component {
    constructor(props) {
      super();

      this.state = {
        charities: [],
        selectedAmount: 10,
      };
    }

    componentDidMount() {
      const self = this;
      fetch('http://localhost:3001/charities')
        .then(function(resp) { return resp.json(); })
        .then(function(data) {
          self.setState({ charities: data }) });

      fetch('http://localhost:3001/payments')
        .then(function(resp) { return resp.json() })
        .then(function(data) {
          self.props.dispatch({
            type: 'UPDATE_TOTAL_DONATE',
            amount: summaryDonations(data.map((item) => (item.amount))),
          });
        })
    }

    render() {
      const self = this;
      const cards = this.state.charities.map(function(item, i) {
        const payments = [10, 20, 50, 100, 500].map((amount, j) => (
          <label style={{paddingRight: 10}} key={j}>
            <input style={{marginRight: 10}}
              type="radio"
              name={"payment"+item.id}
              defaultChecked={amount == 10}
              onClick={function() {
                self.setState({ selectedAmount: amount })
              }} /> 
              <TextStyle>{amount}</TextStyle>
          </label>
        ));

        return (
          <Card key={i}>
            <Payment id={'overlay'+i}>
              <CloseBtnDiv>
                <a href="javascript:void(0)" className="closebtn" onClick={() => closeNav(i)}><TextStyle>&times;</TextStyle></a>
              </CloseBtnDiv>
              <div>
                <div>
                  {<PaymentText>Select the amount to donate (USD)</PaymentText>}
                </div>
                <div>
                  {payments}
                </div>
                <div>
                  <Button id={"payBtn"+item.id} onClick={handlePay.call(self, item, self.state.selectedAmount)}>Pay</Button>
                </div>
              </div>
            </Payment>
            <img src={'./images/'+item.image}/>
            <div style={{float: 'left', textAlign: 'left'}}>
              <TitleH3>{item.name}</TitleH3>
            </div>
            <div style={{float: 'right', textAlign: 'right'}}>
            <Button id={'btn'+i} onClick={() => openNav(i)}>Donate</Button>
            </div>
          </Card>
        );
      });

      const style = {
        color: 'red',
        margin: '1em 0',
        fontWeight: 'bold',
        fontSize: '16px',
        textAlign: 'center',
      };
      const donate = this.props.donate;
      const message = this.props.message;

      const ToastContainerStyle = {
        zIndex: '99'
      };

      return (
        <div>
          {/* ToastContainer: To display notification on screen */}
          <ToastContainer style= {ToastContainerStyle}/>
          <TitleMain>Omise Tamboon React</TitleMain>
          <TotalDonationText>Total Donations: USD {donate}.00</TotalDonationText>
          <CardContainer>{cards}</CardContainer>
        </div>
      );
    }
  }
);

// Start of function //

// Called after user click Pay.
function handlePay(item, amount) {
  const self = this;
  return function() {
    fetch('http://localhost:3001/payments', {
      method: 'POST',
      headers: {'Accept': 'application/json','Content-Type': 'application/json',},
      body: `{ "charitiesId": ${item.id}, "amount": ${amount}, "currency": "${item.currency}" }`,
    })
      .then(function(resp) { return resp.json(); })
      .then(function() {
        self.props.dispatch({
          type: 'UPDATE_TOTAL_DONATE',
          amount,
        });
        self.props.dispatch(notify(item, amount));

        setTimeout(function() {
          self.props.dispatch({
            type: 'UPDATE_MESSAGE',
            message: '',
          });
        }, 2000);
      });
  }
}

// Trigger notification after user click Pay.
function notify(item, amount){
  toast.success('Thanks for donate '+ amount + ' to ' + item.name);
}

// Show Pay div after user click Donate.
function openNav(id) {
  document.getElementById('overlay'+id).style.width = 'inherit';
  document.getElementById('overlay'+id).style.height = 'inherit';
}

// Close Pay div after user click [X] in Pay div.
function closeNav(id) {
  document.getElementById('overlay'+id).style.width = '0%';
  document.getElementById('overlay'+id).style.height = 'inherit';
}

// End of function //
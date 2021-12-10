import React, { Fragment, useEffect, useState } from 'react';
import './Predict.scss';

import { Slider as FramePanel ,SliderThumb } from '@mui/material';
import { styled } from '@mui/material/styles';
import Slider from "react-slick";

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// import { mimAddress, avaAddress } from '../config';

const calculateValue = (value) => { 
    return (value / 0.01 * 100).toFixed()+'%';
}

const PrettoSlider = styled(FramePanel)({
    color: '#52af77',
    height: 8,
    '& .MuiSlider-track': {
      border: 'none',
    },
    '& .MuiSlider-thumb': {
      height: 24,
      width: 24,
      backgroundColor: '#fff',
      border: '2px solid currentColor',
      '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
        boxShadow: 'inherit',
      },
      '&:before': {
        display: 'none',
      },
    },
    '& .MuiSlider-valueLabel': {
      lineHeight: 1.2,
      fontSize: 12,
      background: 'unset',
      padding: 0,
      width: 32,
      height: 32,
      borderRadius: '50% 50% 50% 0',
      backgroundColor: '#52af77',
      transformOrigin: 'bottom left',
      transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
      '&:before': { display: 'none' },
      '&.MuiSlider-valueLabelOpen': {
        transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
      },
      '& > *': {
        transform: 'rotate(45deg)',
      },
    },
});

const Predict = () => {
    const [tagInputVal, setTagInputVal] = useState("");
    const [enter, setEnter ] = useState('');
    const [btnTypeBool, setBtnTypeBool ] = useState();
    const [block, setBlock] = useState('block');

    const [timer, setTimer] = useState(300);
    const [priceData, setPriceData] = useState({
        symbol: 'AVAXUSDT', price: '0.00000', winorlose: -1, betamount: 0
    });

    const [expired, setExpired] = useState([]);
    const [priceDiff, setPriceDiff] = useState(0);

    // round count
    const [currentRound, setCurrentRound] = useState(0);
    const [roundFinished, setRoundFinished] = useState(0);

    const [currentAccount, setCurrentAccount] = useState(null);

    const onChangeTagInput = (e) => {
        setTagInputVal(e.target.value.replace('^[0-9]*[.,]?[0-9]{0,18}$', ""));
        // set the range data
    }

    const showPredictBox_up = () => {
        setEnter('up');
        setBtnTypeBool(true);
        document.getElementsByClassName('p_box_next')[0].style.display = 'none';
        document.getElementsByClassName('position_box')[0].style.display = 'block';
    }
    const showPredictBox_down = () => {
        setEnter('down');
        setBtnTypeBool(false);
        document.getElementsByClassName('p_box_next')[0].style.display = 'none';
        document.getElementsByClassName('position_box')[0].style.display = 'block';
    }
    const hidePredictBox = () => {
        document.getElementsByClassName('position_box')[0].style.display = 'none';
        document.getElementsByClassName('p_box_next')[0].style.display = 'block';
    }
    
    const predictNum = (e) => {
        setTagInputVal(e.target.value);
    }
    const settings = {
        className: "center",
        infinite: false,
        centerPadding: "60px",
        slidesToShow: 3,
        arrows: false,
        swipeToSlide: false,
        afterChange: function(index) {
            
        }
      };

    useEffect(() => {
        setTimeout(() => {
            let timeCount = timer;
            setTimer(timeCount != 0 ? timeCount - 1 : 300);
            // update real time price
            if (timeCount % 5 == 0) updatePrice();
            // get result when the round ends
            if (timeCount == 0) { 
                setRoundFinished(0);
                // push expired card
                expired.push({
                    price: priceData, 
                    diff : priceDiff
                });

                // compare with the previous log
                const increasedRound = currentRound + 1;
                setCurrentRound(increasedRound);
                compareWinOrLose();
            }
        }, 1000);
    }, [timer]);

    const updatePrice = async () => {
        const result = await (await (fetch('https://api.binance.com/api/v3/ticker/price?symbol=AVAXUSDT'))).json();

        const diff = floatValue(result.price) - floatValue(priceData.price);
        if ( diff != 0 ) setPriceDiff(diff);
        setPriceData(result);
    }

    const confirmSubmit = async () => {
        if ( window.ethereum.chainId != 0xa86a ) {
            alert("Please confirm you selected the right network.");
            return;
        }

        // connect();
        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        setCurrentAccount(accounts[0]);
        const transactionParameters = {
            nonce: '0x00', // ignored by MetaMask
            gasPrice: '0x09184e72a000', // customizable by user during MetaMask confirmation.
            gas: '0x2710', // customizable by user during MetaMask confirmation.
            to: '0x5B8d56916FC056144DFa01846Ce4e469560972b9', // Required except during contract publications.
            from: accounts[0], // must match user's active address.
            value: '1', // Only required to send ether to the recipient from the initiating external account.
            data:
              'INV-003', // Optional, but used for defining smart contract creation and interaction.
            chainId: '0x3', // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
          };
        console.log(transactionParameters)

        const txHash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionParameters],
        });

        setRoundFinished(1);
    }

    const compareWinOrLose = () => {
        const tmp_expired = [...expired];
        const diff = floatValue(tmp_expired[currentRound].diff);
        const upordown = diff > 0 ? 'up' : 'down';

        tmp_expired[currentRound].winorlose = enter == upordown ? 1 : enter == '' ? -1 : 0;
        if(roundFinished == 0) tmp_expired[currentRound].winorlose = -1;
        
        setExpired(tmp_expired);
        setEnter('')
    }

    const floatValue = (pricestring) => {
        return parseFloat(pricestring).toFixed(3);
    }

    // ethereum.js configuration

    const connect = () => {
        ethereum
            .request({ method: 'eth_requestAccounts' })
            .then(handleAccountsChanged)
            .catch((err) => {
            if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log('Please connect to MetaMask.');
            } else {
                console.error(err);
            }
        });
    }

    const shortlizeAccountName = (account) => {
        return `${account.slice(0, 4)}...${account.slice(account.length - 4, account.length)}`;
    }

    // For now, 'eth_accounts' will continue to always return an array
    function handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            console.log('Please connect to MetaMask.');
        } else if (accounts[0] !== currentAccount) {
            setCurrentAccount(accounts[0]);
            // Do any other work!
        }
    }

    ethereum.on('chainChanged', handleChainChanged);

    function handleChainChanged(_chainId) {
        // We recommend reloading the page, unless you must do otherwise
        window.location.reload();
    }
    return (
        <Fragment>
            <div className="container">
                <div style={{ width: '1000px' }}>
                <h2>{"$AVAX / USDT"}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{currentAccount ? shortlizeAccountName(currentAccount) : "Not Connected"}</h2>
                <Slider {...settings}>
                    {
                        expired.map((item, index) => {
                            return(
                                <div className="predict_section_1" key={index}>
                                    <div className="p_box_expried" >
                                        <div className="h_panel">
                                            <label className="title1">Expired({item.winorlose > 0 ? 'Win' : item.winorlose == 0 ? 'Lose' : 'Didn\'t participated'})</label>
                                            <label className="title2">#25979</label>
                                        </div>
                                        <div className='p_box_content'>
                                            <div className="up_panel">
                                                <div className="up_panel_img"><center><img src={`assets/prediction/${floatValue(item.diff) < 0 ? 'white' : 'blue'}_panel.png`} width="220" height="65" /></center></div>
                                                <center><p className="title1">UP</p></center>
                                                <center><p className="title2">1.76x Payout</p></center>
                                            </div>
                                            <div className="price_panel">
                                                <div className="box">
                                                    <div className="box_sub1">
                                                        <p className="title1">CLOSED PRICE</p>
                                                    </div>
                                                    <div className="box_sub1">
                                                        <label className={`title2 ${floatValue(item.diff) < 0 ? 'red' : ''}`}>$ { floatValue(item.price.price) }</label>
                                                        <label className={`title3 ${floatValue(item.diff) < 0 ? 'bgRed' : 'bgGreen'}`}>$ { floatValue(item.diff) }</label>
                                                    </div>
                                                    <div className="box_sub1">
                                                        {/* <label className="title4">Locked Price</label>
                                                        <label className="title5">$ 585.460</label> */}
                                                    </div>
                                                    <div className="box_sub1">
                                                        <label className="title6">Prize Pool:</label>
                                                        <label className="title7">14.750 BNB</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="down_panel">
                                                <div className="down_panel_img"><center><img src={`assets/prediction/${floatValue(item.diff) < 0 ? 'red' : 'white'}_panel.png`} width="220" height="65" /></center></div>
                                                <center><p className="title2">2.35x Payout</p></center>
                                                <center><p className="title1">DOWN</p></center>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                    <div className="predict_section_1">
                        <div className="p_box_live" style={{display: `${block}`}}>
                            <div className="h_panel">
                                <label className="title1">LIVE</label>
                                <label className="title2">#25980</label>
                            </div>
                            <div className='counter' style={{borderTop: '1px solid',borderBottom: '1px solid'}}>
                                <div className="p_frame" style={{ width: `${(300 - timer) / 3}%` }}></div>
                            </div>
                            <div className="up_panel">
                                <div className="up_panel_img"><center><img src={`assets/prediction/${priceDiff > 0 ? 'blue' : 'white'}_panel.png`} width="220" height="65" /></center></div>
                                <center><p className="title1">UP</p></center>
                                <center><p className="title2">1.76x Payout</p></center>
                            </div>
                            <div className="price_panel">
                                <div className="box">
                                    <div className="box_sub1">
                                        <p className="title1">LAST PRICE</p>
                                    </div>
                                    <div className="box_sub1">
                                        <label className={`title2 ${priceDiff >= 0 ? '' : 'red'}`}>$ { floatValue(priceData.price) }</label>
                                        <label className={`title3 ${priceDiff >= 0 ? 'bgGreen' : 'bgRed'}`}>$ { floatValue(priceDiff) }</label>
                                    </div>
                                    <div className="box_sub1">
                                        {/* <label className="title4">Locked Price</label>
                                        <label className="title5">$ 585.460</label> */}
                                    </div>
                                    <div className="box_sub1">
                                        {/* <label className="title6">Prize Pool:</label>
                                        <label className="title7">14.750 BNB</label> */}
                                    </div>
                                </div>
                            </div>
                            <div className="down_panel">
                                <div className="down_panel_img"><center><img src={`assets/prediction/${priceDiff > 0 ? 'white' : 'red'}_panel.png`} width="220" height="65" /></center></div>
                                <center><p className="title2">2.35x Payout</p></center>
                                <center><p className="title1">DOWN</p></center>
                            </div>
                        </div>
                    </div>
                    <div className="predict_section_1">
                        <div className="p_box_next">
                            <div className="h_panel">
                                <label className="title1">Next</label>
                                <label className="title2">#25981</label>
                            </div>
                            <div className="up_panel">
                                <div className="up_panel_img"><center><img src="assets/prediction/blue_panel.png" width="220" height="65" /></center></div>
                                <center><p className="title1">UP</p></center>
                                <center><p className="title2">Ox Payout</p></center>

                            </div>
                            <div className="price_panel">
                                <div className="box">
                                    <div className="box_sub1">
                                        <label className="title6">Prize Pool:</label>
                                        <label className="title7">1.653 BNB</label>
                                    </div>
                                    <div className="box_sub2">
                                        <button className="enterup" onClick={showPredictBox_up}>Enter UP</button>
                                        <button className="enterdown" onClick={showPredictBox_down}>Enter DOWN</button>
                                    </div>
                                </div>
                            </div>
                            <div className="down_panel">
                                <div className="down_panel_img"><center><img src="assets/prediction/white_panel.png" width="220" height="65" /></center></div>
                                <center><p className="title2">2.35x Payout</p></center>
                                <center><p className="title1">DOWN</p></center>
                            </div>
                        </div>

                        <div className="position_box" style={{ display: 'none' }}>
                            <div className="header">
                                <label className="title1"><ArrowBackIcon onClick={hidePredictBox} style={{ cursor: 'pointer' }} /> Position</label>
                                {btnTypeBool ? (
                                    <label className="title2">UP</label>
                                ) : (
                                    <label className="title3">DOWN</label>
                                )}
                                
                            </div>
                            <div className="commit_panel">
                                <label className="title1">Commit</label>
                                <div>
                                    <label className="title2">
                                    BNB
                                    </label>
                                </div>
                            </div>
                            <div className="input_panel" >
                                <div className="balance_input">  
                                    <input id="tag-input" type="number" step={0.0001} min={0} max={0.01} placeholder="0.0" value={tagInputVal} onChange={(e) => onChangeTagInput(e)} />        
                                </div>
                                <label className="balance_text">Balance: 0.001598955</label>
                            </div>
                            <div className="frame_panel">
                                <PrettoSlider
                                    valueLabelDisplay="auto"
                                    aria-label="pretto slider"
                                    min={0}
                                    max={0.01}
                                    step={0.00001}
                                    scale={calculateValue} 
                                    onChange={predictNum}
                                />
                            </div>
                            <div className="confirm_panel">
                                <button className="confirm_btn" onClick={confirmSubmit}>Confirm</button>
                                <p className="title1">You won’t be able to remove or change your position once you enter it.</p>
                            </div>
                        </div>
                    </div>
                </Slider>
                </div>
            </div>
        </Fragment>
    )
}

export default Predict;

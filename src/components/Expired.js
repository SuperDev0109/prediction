import React, { Fragment, useState } from 'react';
import './Predict.scss';

export default Expired = () => {
    return (
        <>
            <div className="predict_section_1" >
                <div className="p_box_expried" >
                    <div className="h_panel">
                        <label className="title1">Expried</label>
                        <label className="title2">#25979</label>
                    </div>
                    <div className="up_panel">
                        <div className="up_panel_img"><center><img src="assets/prediction/blue_panel.png" width="220" height="65" /></center></div>
                        <center><p className="title1">UP</p></center>
                        <center><p className="title2">1.76x Payout</p></center>
                    </div>
                    <div className="price_panel">
                        <div className="box">
                            <div className="box_sub1">
                                <p className="title1">CLOSED PRICE</p>
                            </div>
                            <div className="box_sub1">
                                <label className="title2">$ 583,520</label>
                                <label className="title3">$ 0.460</label>
                            </div>
                            <div className="box_sub1">
                                <label className="title4">Locked Price</label>
                                <label className="title5">$ 585.460</label>
                            </div>
                            <div className="box_sub1">
                                <label className="title6">Prize Pool:</label>
                                <label className="title7">14.750 BNB</label>
                            </div>
                        </div>
                    </div>
                    <div className="down_panel">
                        <div className="down_panel_img"><center><img src="assets/prediction/white_panel.png" width="220" height="65" /></center></div>
                        <center><p className="title2">2.35x Payout</p></center>
                        <center><p className="title1">DOWN</p></center>
                    </div>
                </div>
            </div>
        </>
    );
}
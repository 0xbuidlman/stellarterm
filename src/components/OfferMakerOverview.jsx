import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import TrustButton from './Session/TrustButton';
import OfferMakerResultMessage from './OfferMakerResultMessage';
import Driver from '../lib/Driver';

export default class OfferMakerOverview extends React.Component {
    static capDigits(input) {
        try {
            return new BigNumber(input).toFixed(7).toString();
        } catch (e) {
            return input;
        }
    }

    getBalance() {
        const { targetAsset } = this.props;
        const maxOffer = this.calculateMaxOffer();
        const maxOfferView = this.constructor.capDigits(maxOffer);

        return (
            <div>
                <div className="OfferMaker__youHave">
                    {targetAsset.isNative() ?
                        (<span>You may trade up to {maxOfferView} XLM (due to <a href="#account">
                                                               minimum balance requirements</a>.)</span>) :
                        (<span>You have {maxOfferView} {targetAsset.getCode()}</span>)
                    }
                </div>
                {this.isInsufficientBalance() &&
                    <p className="OfferMaker__insufficientBalance">
                        Error: You do not have enough {targetAsset.getCode()} to create this offer.
                    </p>
                }
            </div>
        );
    }
    getInputSummaryMessage() {
        const { valid, amount, total } = this.props.offerState;
        if (!valid) {
            return null;
        }
        const isBuy = this.props.side === 'buy';
        const capitalizedSide = isBuy ? 'Buy' : 'Sell';
        const baseAssetName = this.props.d.orderbook.data.baseBuying.getCode();
        const counterAssetName = this.props.d.orderbook.data.counterSelling.getCode();

        return (
            <div className="s-alert s-alert--info">
                {capitalizedSide} {this.constructor.capDigits(amount)} {baseAssetName} for{' '}
                {this.constructor.capDigits(total)} {counterAssetName}
            </div>
        );
    }

    getSubmitButton() {
        const isBuy = this.props.side === 'buy';
        const capitalizedSide = isBuy ? 'Buy' : 'Sell';
        const baseAssetName = this.props.d.orderbook.data.baseBuying.getCode();

        const { valid, buttonState } = this.props.offerState;
        const isButtonReady = buttonState === 'ready';

        return (
            <input
                type="submit"
                className="s-button"
                value={isButtonReady ? `${capitalizedSide} ${baseAssetName}` : 'Creating offer...'}
                disabled={!valid || this.isInsufficientBalance() || !isButtonReady} />
        );
    }

    getTrustNeededAssets() {
        const { baseBuying, counterSelling } = this.props.d.orderbook.data;
        const { account } = this.props.d.session;
        const baseBalance = account.getBalance(baseBuying);
        const counterBalance = account.getBalance(counterSelling);

        const trustNeededAssets = [];
        if (baseBalance === null) {
            trustNeededAssets.push(baseBuying);
        }
        if (counterBalance === null) {
            trustNeededAssets.push(counterSelling);
        }
        return trustNeededAssets;
    }

    calculateMaxOffer() {
        const { targetAsset } = this.props;
        const { account } = this.props.d.session;
        const maxLumenSpend = account.maxLumenSpend();

        const targetBalance = targetAsset.isNative() ? maxLumenSpend : account.getBalance(targetAsset);
        const reservedBalance = account.getReservedBalance(targetAsset);

        return (parseFloat(targetBalance) > parseFloat(reservedBalance)) ?
            targetBalance - reservedBalance : 0;
    }

    isInsufficientBalance() {
        const isBuy = this.props.side === 'buy';
        const maxOffer = this.calculateMaxOffer();
        const { amount, total } = this.props.offerState;

        return Number(isBuy ? total : amount) > Number(maxOffer);
    }

    render() {
        const login = this.props.d.session.state === 'in';

        if (!login) {
            return (
                <div>
                    {this.getInputSummaryMessage()}
                    <span className="OfferMaker__message">
                        <a href="#account">Log in</a> to create an offer
                    </span>
                </div>
            );
        }

        const trustNeededAssets = this.getTrustNeededAssets();

        if (trustNeededAssets.length) {
            return (
                <div>
                    <p className="OfferMaker__enable">To trade, activate these assets on your account:</p>
                    <div className="row__multipleButtons">
                        {trustNeededAssets.map(asset => (
                            <TrustButton
                                key={`${asset.getCode()}-${asset.getIssuer()}`}
                                d={this.props.d}
                                asset={asset}
                                message={`${asset.getCode()} accepted`}
                                trustMessage={`Accept ${asset.getCode()}`} />
                        ))}
                    </div>
                </div>
            );
        }
        return (
            <div className="OfferMaker__overview">
                {this.getBalance()}
                {this.getInputSummaryMessage()}
                <OfferMakerResultMessage offerState={this.props.offerState} />
                {this.getSubmitButton()}
            </div>
        );
    }
}
OfferMakerOverview.propTypes = {
    side: PropTypes.oneOf(['buy', 'sell']).isRequired,
    d: PropTypes.instanceOf(Driver).isRequired,
    targetAsset: PropTypes.objectOf(PropTypes.string),
    offerState: PropTypes.shape({
        valid: PropTypes.bool,
        amount: PropTypes.string,
        total: PropTypes.string,
        buttonState: PropTypes.oneOf(['ready', 'pending']),
    }).isRequired,
};

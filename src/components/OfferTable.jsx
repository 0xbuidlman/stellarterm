import React from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';
import Printify from '../lib/Printify';
import Format from '../lib/Format';


// Dumb component that mainly renders the UI
export default function OfferTable(props) {
    const isBuy = props.side === 'buy';
    const isOffers = props.offers.length !== 0;

    const depthNumDecimals = isOffers ?
        Math.max(0, Format.niceNumDecimals(props.offers[props.offers.length - 1].depth)) : 7;

    const priceIndex = isBuy ? (props.offers.length - 1) : 0;
    const priceNumDecimals = isOffers ?
        Math.max(4, Format.niceNumDecimals(props.offers[priceIndex].price)) : 7;


    const headerItems = [
        `Sum ${props.counterCurrency}`,
        props.counterCurrency,
        props.baseCurrency,
        'Price'];

    if (!isBuy) { headerItems.reverse(); }

    const header = headerItems.map(item => (
        <div className="OfferTable__header__item" key={item}>{item}</div>
    ));

    return (
        <div className="OfferTable">
            <div className="OfferTable__header">{header}</div>
            <div className="OfferTable__table">
                {props.offers.map((offer, index) => {
                    const altColor = index % 2 === 0 ? '#fff' : '#f9f9f9'; // #f4f4f5 is $s-color-neutral8
                    const depthPercentage =
                        Math.min(100, Number((offer.depth / props.maxDepth) * 100).toFixed(1));
                    const rowStyle = {};
                    const background = isBuy ? '#dcf6de' : '#fed6d8';
                    const gradientDirection = isBuy ? 'to left' : 'to right';
                    rowStyle.background =
                        `linear-gradient(${gradientDirection}, ${background} ${depthPercentage}%, ${altColor} ${depthPercentage}%)`;

                    const rowItems = [
                        Printify.lightenZeros(offer.price, priceNumDecimals),
                        Printify.lightenZeros(offer.base),
                        Printify.lightenZeros(offer.counter),
                        Number(offer.depth).toLocaleString('en-US',
                            { minimumFractionDigits: depthNumDecimals, maximumFractionDigits: depthNumDecimals })];

                    if (isBuy) { rowItems.reverse(); }

                    const row = rowItems.map((item, i) => {
                        const key = offer.key + i;
                        return (
                            <div key={key} className="OfferTable__row__item">{item}</div>
                        );
                    });

                    return (
                        <div
                            className="OfferTable__row"
                            key={offer.key}
                            style={rowStyle}
                            onClick={() => props.d.orderbook.handlers.pickPrice(offer.price)}>
                            {row}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
OfferTable.propTypes = {
    offers: PropTypes.arrayOf(PropTypes.object).isRequired,
    side: PropTypes.oneOf(['buy', 'sell']).isRequired,
    counterCurrency: PropTypes.string,
    baseCurrency: PropTypes.string,
    maxDepth: PropTypes.instanceOf(BigNumber),
};

import React from 'react';
import AssetPair from './AssetPair';
import AssetPickerNarrow from './AssetPickerNarrow';

export default class CustomMarketPicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            baseBuying: null,
            counterSelling: null,
        };

        this.baseBuyingUpdate = (asset) => {
            this.setState({
                baseBuying: asset,
            });
        };
        this.counterSellingUpdate = (asset) => {
            this.setState({
                counterSelling: asset,
            });
        };
    }

    render() {
        const { baseBuying, counterSelling } = this.state;
        const classDivision = 'island__sub__division';

        const pickedAsset =
            baseBuying || counterSelling ? (
                <AssetPair row baseBuying={this.state.baseBuying} counterSelling={this.state.counterSelling} />
            ) : null;

        return (
            <div className="island">
                <div className="island__header">Custom exchange pair</div>

                <div className="island__sub CustomMarketPicker_title">
                    <div className={classDivision}>
                        <h3 className={`${classDivision}__title`}>Base asset</h3>
                    </div>
                    <div className={classDivision}>
                        <h3 className={`${classDivision}__title`}>Counter asset</h3>
                    </div>
                </div>

                <div className="island__sub CustomMarketPicker_picker">
                    <div className={classDivision}>
                        <AssetPickerNarrow onUpdate={this.baseBuyingUpdate} />
                    </div>
                    <div className={classDivision}>
                        <AssetPickerNarrow onUpdate={this.counterSellingUpdate} />
                    </div>
                </div>
                {pickedAsset}
            </div>
        );
    }
}

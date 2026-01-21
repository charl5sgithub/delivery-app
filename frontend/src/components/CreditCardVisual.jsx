import React from 'react';

const CreditCardVisual = ({ name }) => {
    const [activeCard, setActiveCard] = React.useState(null);

    const handleCardClick = (cardIndex) => {
        setActiveCard(activeCard === cardIndex ? null : cardIndex);
    };

    return (
        <div className="credit-card-container">
            <div className="wallet-stack">
                {/* Card 1 (Back) */}
                <div
                    className={`credit-card card-1 ${activeCard === 1 ? 'selected' : ''}`}
                    onClick={() => handleCardClick(1)}
                >
                    <div className="card-front">
                        <div className="card-logo">MasterCard</div>
                        <div className="card-number" style={{ opacity: 0.5 }}>•••• •••• •••• 8899</div>
                    </div>
                </div>

                {/* Card 2 (Middle) */}
                <div
                    className={`credit-card card-2 ${activeCard === 2 ? 'selected' : ''}`}
                    onClick={() => handleCardClick(2)}
                >
                    <div className="card-front">
                        <div className="card-logo">AMEX</div>
                        <div className="card-number" style={{ opacity: 0.5 }}>•••• •••• •••• 3456</div>
                    </div>
                </div>

                {/* Card 3 (Front - Active) */}
                <div
                    className={`credit-card card-main ${activeCard === 3 ? 'selected' : ''}`}
                    onClick={() => handleCardClick(3)}
                >
                    <div className="card-front">
                        <div className="card-chip"></div>
                        <div className="card-logo">VISA</div>
                        <div className="card-number">•••• •••• •••• ••••</div>
                        <div className="card-holder">
                            <span className="card-label">Card Holder</span>
                            <span className="card-name">{name || "Card Holder"}</span>
                        </div>
                        <div className="card-expiry">
                            <span className="card-label">Expires</span>
                            <span className="card-date">MM/YY</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditCardVisual;

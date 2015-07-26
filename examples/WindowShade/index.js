var React = require('react-native');
var {
    StyleSheet,
    Text,
    View,
    Image,
    Animated,
    PanResponder
    } = React;
var Card = require('./Card');
var Dimensions = require('Dimensions');
var Easing = require('Easing');
var Interpolation = require('Interpolation');
var { width, height } = Dimensions.get('window');



var CARDS = [
    {
        id: 1,
        color: 'green',
        icon: 'folder',
        title: '1 applications updated',
        subtitle: 'Uver, Google Wallet, YouTube, Airbnb, and...'
    },
    {
        id: 2,
        color: 'green',
        icon: 'folder',
        title: '2 applications updated',
        subtitle: 'Uver, Google Wallet, YouTube, Airbnb, and...'
    },
    {
        id: 3,
        color: 'green',
        icon: 'folder',
        title: '3 applications updated',
        subtitle: 'Uver, Google Wallet, YouTube, Airbnb, and...'
    },
    {
        id: 4,
        color: 'green',
        icon: 'folder',
        title: '4 applications updated',
        subtitle: 'Uver, Google Wallet, YouTube, Airbnb, and...'
    },
    {
        id: 5,
        color: 'green',
        icon: 'folder',
        title: '1 applications updated',
        subtitle: 'Uver, Google Wallet, YouTube, Airbnb, and...'
    },
    {
        id: 6,
        color: 'green',
        icon: 'folder',
        title: '2 applications updated',
        subtitle: 'Uver, Google Wallet, YouTube, Airbnb, and...'
    },
    {
        id: 7,
        color: 'green',
        icon: 'folder',
        title: '3 applications updated',
        subtitle: 'Uver, Google Wallet, YouTube, Airbnb, and...'
    },
    {
        id: 8,
        color: 'green',
        icon: 'folder',
        title: '4 applications updated',
        subtitle: 'Uver, Google Wallet, YouTube, Airbnb, and...'
    },
];

var easing = Easing.bezier(.56,.17,.57,.85, (1000 / 60 / 4000) / 4);


var CARDX = 240;
var CARDY = 400;
var START_TOP = 50;
var h = CARDY * 0.6;

var CARD_HEIGHT = 45 + 4;

var MIN = 0;
var MAX = CARD_HEIGHT * (CARDS.length - 1);
var MARGIN = 30;

CARDS = CARDS.reverse();

var WindowShade = React.createClass({

    getInitialState() {
        return {
            panY: new Animated.Value(MIN)
        };
    },
    direction: null,
    componentWillMount() {
        this.responder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                this.state.panY.setOffset(this.state.panY.getAnimatedValue());
                this.state.panY.setValue(0);
            },
            onPanResponderMove: (_, { dy, dx, y0 }) => {
                var y = this.state.panY._offset + dy;

                if (y > MAX) {
                    y = MAX + (y - MAX) / 3;
                }
                if (y < MIN) {
                    y = MIN - (MIN - y) / 3;
                }
                y = y - this.state.panY._offset;
                this.state.panY.setValue(y);
            },
            onPanResponderRelease: (e, { vy, vx, dx, dy }) => {
                var { panY } = this.state;
                panY.flattenOffset();
                if (panY._value < MIN) {
                    Animated.spring(panY, {
                        toValue: MIN,
                        velocity: vy
                    }).start();
                } else if (panY._value > MAX) {
                    Animated.spring(panY, {
                        toValue: MAX,
                        velocity: vy
                    }).start();
                } else {
                    Animated.decay(this.state.panY, {
                        velocity: vy,
                        deceleration: 0.993
                    }).start(() => {
                        panY.removeListener(this._listener);
                    });

                    this._listener = panY.addListener(( { value } ) => {
                        if (value < MIN) {
                            panY.removeListener(this._listener);
                            Animated.spring(panY, {
                                toValue: MIN,
                                velocity: vy
                            }).start();
                        } else if (value > MAX) {
                            panY.removeListener(this._listener);
                            Animated.spring(panY, {
                                toValue: MAX,
                                velocity: vy
                            }).start();
                        }
                    });
                }

            },
        });
    },

    cardIndexFor(y0, panY) {
        var length = CARDS.length;
        var result = null;
        for (var i = 0; i < length; i++) {
            var hx = h * (length - i - 1);
            var hxm = Math.max(hx-h, 0);
            // y0 is the position they started the touch on the screen
            // panY is the current animated value
            var translateY = Interpolation.create({
                inputRange: [0, hxm, hx+1, height+hx],
                outputRange: [0, 0, 10, 30 + height],
                easing: easing
            })(panY);

            var scale = Interpolation.create({
                inputRange: [0, hx+1, 0.8*height+hx, height+hx, height + hx + 1],
                outputRange: [1, 1, 1.4, 1.3, 1.3]
            })(panY);

            var cardTop = START_TOP + translateY - (scale - 1) / 2 * CARDY;

            if (cardTop < y0) {
                result = i;
            }
        }
        return result;
    },

    render: function () {
        var { panY } = this.state;
        var HEIGHT = 300 // height - 2 * MARGIN - CARD_HEIGHT;
        return (
            <View
                style={styles.container}
                {...this.responder.panHandlers}>
                {CARDS.map((card, i) => {
                    var h = CARD_HEIGHT;
                    var hx = h * i;
                    var scroll = panY.interpolate({
                        inputRange:  [hx, HEIGHT + hx],
                        outputRange: [ 0,      HEIGHT]
                    });

                    var translateY = scroll.interpolate({
                        inputRange:  [-h-1, -h,  0,  HEIGHT-h, HEIGHT, HEIGHT + 1],
                        outputRange: [   0,  0, 15, HEIGHT-15, HEIGHT,     HEIGHT],
                    });

                    return (
                        <Animated.View
                            key={card.id}
                            style={{
                                position: 'absolute',
                                left: 30,
                                right: 30,
                                top: 30,
                                backgroundColor: 'transparent',
                                transform: [
                                    { translateY }
                                ],
                            }}>
                            <Card card={card} />
                        </Animated.View>
                    );
                })}
            </View>
        );
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2e2f31',
    }
});

module.exports = WindowShade;

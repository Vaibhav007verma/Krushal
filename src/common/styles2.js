const styles2a = {
    abutton: {
        backgroundColor: 'color.primaryText',
    }
}
const styles2 = {
    button: {
        height: 45, width: "50%",
        backgroundColor: color.textOrIcons,
        borderWidth: 1,
        borderWidthRadius: 2,
        borderColor: color.darkPrimaryColor,
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginTop: 15,

    },
    button1: {
        height: 45,
        width: "50%",
        backgroundColor: color.lightPrimaryColor,
        borderWidth: 2,
        borderWidthRadius: 2,
        borderColor: 'rgb(103,59,183)',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginTop: 20,

    },
    buttonText: {
        textAlign: 'center',
        fontSize: size.font20,
        color: color.primaryText,

    },
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
        height: "100%",

    },
    image: {
        height: 220,
        width: "85%",
        marginTop: -130,
        borderRadius: 15

    },
    heading: {
        fontSize: size.font45,
        fontWeight: weight.full,
        color: color.darkPrimaryColor,
        marginBottom: 150,
        marginTop: 30,

    },
    primaryButton: {
        height: 55,
        width: "85%",
        backgroundColor: color.primaryColor,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 55,
        marginBottom: 15,

    },
    primaryButtonText: {
        color: color.textOrIcons,
        fontSize: size.font20,
        fontWeight: weight.full,

    },
    subheading: {
        fontWeight: weight.semi,
        color: color.primaryText,
        fontSize: size.font25,
        textAlign: 'center',
        marginTop: 15,

    },
    subheading2: {
        textAlign: 'center',
        fontSize: size.font18,
        fontWeight: weight.low,
        marginTop: 5,
        marginBottom: 5,
        color: color.secondaryColor,

    },
    underLineStyleBase: {
        width: 50,
        height: 50,
        borderWidth: 2,
        borderRadius: 10,
        borderBottomWidth: 2,
        fontWeight: weight.semi,
        fontSize: size.font25,
        fontColor: 'red',
        includeFontPadding: true,
        paddingHorizontal: 15,
        paddingVertical: 5,
        color: color.primaryText,

    },
    underlineHighLightStyle: {
        borderColor: color.otpHighlightedColor,
        fontColor: 'red',
        backgroundColor: 'transparent',

    }
}
export default { styles2, styles2a }
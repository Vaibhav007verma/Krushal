const basicStyles = {
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  spacing: {
    flex: 1,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  input: {
    borderWidth: 2,
    borderColor: 'lightblue',
    width: 300,
    marginVertical: 10,
    fontSize: 25,
    placeHolderFontSize: 14,
    padding: 10,
    borderRadius: 8,
    color: '#000000',
  },
  text: {
    fontSize: 25,
    color: 'red'
  },
  label: {
    fontSize: 16,
    color: 'grey'
  },
  paper: {
    input: {
      width: 300,
      fontSize: 25,
      placeHolderFontSize: 14,
      padding: 10,
      color: '#000000',
      textColor: '#000000',
      backgroundColor: 'white',
      borderWidth: 0
    },
  },
  text: {
    fontSize: 25,
    color: 'red'
  },
  label: {
    fontSize: 16,
    color: 'grey'
  }
}

const cardStyles = {
  card: {
    backgroundColor:"#fefefe",
  },
  title: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    minHeight: 48,
    backgroundColor:"#ededed",
    justifyContent: "center"
  },
  titleText: {
    color: '#000000'
  },
  cardContent: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    alignItems: 'center',
    backgroundColor: "#efefef"
  },
  cardContentText: {
    color: '#000000'
  },
  cardContentLayer: {
    minHeight: 48
  },
  cardActionArea: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: "#dedede",
    justifyContent: 'center',
  },
  cardAction: {
    color: '#000000'
  },
}

const fabStyles = {
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  }
}
module.exports = { basicStyles, cardStyles, fabStyles }
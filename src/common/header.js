import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

/*
    <View style={styles.activityBarWrapper}>
      <View>
        <Text style={styles.activityNameText}>props.title</Text>
      </View>
    </View>
*/
const DrawerActivityBar = (props) => {
  const burgerMenuPress = () => {
    props.navigation.openDrawer()
  }
  return (
    <View style={styles.activityBarWrapper}>
      <Icon name="menu" size={30} style={styles.activityBarIcon} onPress={() => burgerMenuPress()} />
      <View>
        <Text style={styles.activityNameText}>{props.title}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  activityBarIcon: {
    color: "#000000"
  },
  activityBarWrapper: {
    width: '100%',
    height: '100%',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  activityNameText: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#333",
    letterSpacing: 1,
    marginLeft: 16
  }
})

module.exports = { DrawerActivityBar }
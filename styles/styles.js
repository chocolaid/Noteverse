import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        padding: 8,
        paddingTop: 40,
    },
    homeHeaderSection: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 8,
    },
    homeHeaderText: {
        fontSize: 32,
        fontWeight: "bold",
        fontFamily: "SFPRODISPLAYBOLD",
    },
    HomeHeaderIcon: {
        height: 20,
        width: 20,
        marginRight: 10,
    },
    searchSection: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
    },
    searchInputContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderRadius: 10,
        flexGrow: 1,
    },
    searchIcon: {
        height: 15,
        width: 15,
        marginRight: 8,
    },
    searchInput: {
        fontSize: 16,
        fontWeight: "300",
        flexGrow: 2,
    },
    noteSection: {
        display: "flex",
        flexDirection: "column",
        paddingVertical: 10,
    },
    favoriteSection: {
        display: "flex",
        flexDirection: "column",
        paddingVertical: 8,
    },
    favoriteSectionText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    noteSectionText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    noteText: {
        fontSize: 14,
        fontWeight: "300",
    },
    noteDate: {
        fontSize: 12,
        fontWeight: "300",
    },
    seeAllText: {
        fontSize: 16,
        fontWeight: "300",
    },

    notesFlatList: {
        display: "flex",
        flexDirection: "column",
        padding: 10,
    },
    noteCard: {
        display: "flex",
        flexDirection: "column",
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
    },
    fabButton: {
        position: "absolute",
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    fabButtonText: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
    },
    keyboardAvoidingView: {
        position: 'absolute',
        width: '100%',
        bottom: 0,
      },

    noteEditorHeader: {
        padding: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#d8d8d8'
    },


    


    backTextWhite: {
        color: '#FFF',
    },
    rowFront: {
        alignItems: 'center',
        backgroundColor: '#CCC',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        justifyContent: 'center',
        height: 50,
    },
    rowBack: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 70,
        padding: 10,
        marginVertical: 5,

    },
    backRightBtnLeft: {
        backgroundColor: 'blue',
        right: 70,
        padding: 10,
        marginVertical: 5,
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0,
    },

    settingsCategory: {
        display: 'flex',
        flexDirection: 'column',
        padding: 8,
    },
    settingsCategoryTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    settingsCategoryItem: {
        display: 'flex',
        flexDirection: 'column',
        padding: 8,
    },
    settingsCategoryItemOption: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
    },
    settingsCategoryItemOptionText: {
        fontSize: 16,
        fontWeight: '300',
    },
    settingsCategoryItemOptionDescription: {
        fontSize: 12,
        fontWeight: '300',
        marginLeft: 8,
    },
    settingsCategoryItemOptionTextInput: {
        height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    },

    settingsCategoryItemOptionSwitch: {
        transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
    },
    settingsCategoryItemOptionSlider: {
        width: '100%',
    },

    
    

});

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        display: "flex",
        flex: 1,
        backgroundColor: "#fff",
        flexDirection: "column",
    },
    homeHeaderSection: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,
    },
    homeHeaderText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    });
import React from 'react';
import {Text,View,TouchableOpacity,TextInput,KeyboardAvoidingView,Image,StyleSheet} from 'react-native';
import firebase from 'firebase';
//test@gmail.com
//123456

export default class LoginScreen extends React.Component {
    constructor(){
        super();
        this.state = {
            emailId : '',
            password : '',
        }
    }
    login = async(email,password)=>{
        console.log(email);
        console.log(password);
        if(email&&password){
            try{
                const response = await firebase.auth().signInWithEmailAndPassword(email,password);
                console.log(response);
                if(response){
                    this.props.navigation.navigate("Transaction");
                }
            }catch(error){
                console.log(error.code)
                switch(error.code){
                    case 'auth/user-not-found':
                        alert("User does not exist!");
                        break;
                    case 'auth/invalid-email':
                        alert("Invalid email ID!");
                        break;
                    case 'auth/wrong-password':
                        alert("Wrong Password!");
                        break;
                    default:
                        alert("Please try again!");
                }
            }
        }else{
            alert("Enter email and password!")
        }
    }
    render(){
        return(
            <KeyboardAvoidingView style = {{alignItems :"center", marginTop : 20}}>
            <View>
                <Image source = {require("../assets/booklogo.jpg")} style = {{width:200, height:200}}></Image>
                <Text style = {{textAlign : "center", fontSize:30}}>WILY</Text>
            </View>
            <View>
                <TextInput 
                style = {StyleSheet.InputBox} 
                placeholder = "abc@example.com"
                keyboardType = "email-address"
                onChangeText = {text =>{
                    this.setState({
                        emailId : text,
                    })
                }}></TextInput>
                <TextInput
                style = {StyleSheet.InputBox}
                placeholder = "Enter Password"
                secureTextEntry = {true}
                onChangeText = {text=>{
                    this.setState({
                        password : text,
                    })
                }}>
                </TextInput>
            </View>
            <TouchableOpacity 
            style = {styles.submitButton}
            onPress = {()=>{
                this.login(this.state.emailId,this.state.password)
            }}>
                <Text style = {{textAlign : "center"}}>Login</Text>
            </TouchableOpacity>
            </KeyboardAvoidingView>
        );
    }
}
const styles = StyleSheet.create({
    InputBox : {
        width : 300,
        height : 40,
        borderWidth :1.5,
        fontSize : 20,
        margin : 10,
        paddingLeft : 10
    },
    submitButton : {
        height : 30,
        width : 90,
        borderWidth : 1,
        marginTop : 28,
        paddingTop : 5,
        borderRadius : 5,
        alignSelf : "center",
    }
})
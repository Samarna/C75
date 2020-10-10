import React from 'react';
import {Text,View,TouchableOpacity,StyleSheet,Image,KeyboardAvoidingView,ToastAndroid, TextPropTypes, Alert} from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import { TextInput } from 'react-native-gesture-handler';
import db from '../config.js';
import firebase from 'firebase';

export default class BookTransactionScreen extends React.Component {
    constructor(){
        super();
        this.state = {
            hasCameraPermissions : null,
            scanned : false,
            buttonState : 'normal',
            scannedBookId : '',
            scannedStudentId : '',
        }
    }
    getCameraPermissions = async(id) =>{
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            /*status === "granted" is true when user has granted permission status === "granted" is false
             when user has not granted the permission */
            hasCameraPermissions : status === 'granted',
            buttonState : id,
            scanned : false,
        })
    }
    handleBarCodeScanned = async({type,data}) =>{
        const {buttonState} = this.state;
        if(buttonState === "BookID"){
            this.setState({scanned : true, scannedBookId : data, buttonState : 'normal'});
        }
        else if(buttonState === "StudentID"){
            this.setState({scanned : true, scannedStudentId : data, buttonState : 'normal'});
        }
    }
    initiateBookIssue =()=>{
        //add a transaction
        db.collection("Transactions").add({
            'studentId' : this.state.scannedStudentId,
            'bookId' : this.state.scannedBookId,
            'date' : firebase.firestore.Timestamp.now().toDate(),
            'txnType' : "issue"
        })
        //change the book's availability
        db.collection("Books").doc(this.state.scannedBookId).update({
            'bookAvailable' : false
        })
        //change number of books issued by student
        db.collection("Students").doc(this.state.scannedStudentId).update({
            'numBooksIssued' : firebase.firestore.FieldValue.increment(1)
        })
        //alert("The book has been issued");
        this.setState({
            scannedBookId : '',
            scannedStudentId : ''
        })
    }
    initiateBookReturn =()=>{
        //add a transaction
        db.collection("Transactions").add({
            'studentId' : this.state.scannedStudentId,
            'bookId' : this.state.scannedBookId,
            'date' : firebase.firestore.Timestamp.now().toDate(),
            'txnType' : "return"
        })
        //change book availability
        db.collection("Books").doc(this.state.scannedBookId).update({
            'bookAvailable' : true
        })
        //change number of books issued by student
        db.collection("Students").doc(this.state.scannedStudentId).update({
            'numBooksIssued' : firebase.firestore.FieldValue.increment(-1)
        })
        //alert("The book has been returned");
        this.setState({
            scannedBookId : '',
            scannedStudentId : ''
        })
    }
    checkBookAvailability = async()=>{
        console.log("Inside checkBookAvailability");
        const bookRef = await db.collection("Books").where("bookId","==",this.state.scannedBookId).get();
        var txnType = "";
        if(bookRef.docs.length === 0){
            txnType = false;
        }else{
            bookRef.docs.map((doc)=>{
                var book = doc.data();
                if(book.bookAvailable){
                    txnType = "issue"; 
                }else{
                    txnType = "return";
                }
            })
        }
        return txnType;
    }
    checkStudentEligibilityForBookIssue = async()=>{
        console.log(this.state.scannedStudentId);
        console.log("Inside checkStudentEligibilityForBookIssue");
        const studentRef = await db.collection("Students").where("studentID","==",this.state.scannedStudentId).get();
        var isStudentEligible = "";
        console.log(studentRef.docs.length);
        if(studentRef.docs.length === 0){
            this.setState({
                scannedBookId : "",
                scannedStudentId : ""
            })
            isStudentEligible = false;
            alert("This student ID does not exist!");
        }else{
            studentRef.docs.map((doc)=>{
                var student = doc.data();
                if(student.numBooksIssued<2){
                    isStudentEligible = true;
                }else{
                    isStudentEligible = false;
                    alert("This student has already issued 2 books!");
                    this.setState({
                        scannedBookId : "",
                        scannedStudentId : ""
                    });
                }
            })
        }
    }

    checkStudentEligibilityForBookReturn=async()=>{
        console.log("Inside checkStudentEligibilityForBookReturn");
        const transactionRef = await db.collection("Transactions").where("bookId","==",this.state.scannedBookId).limit(1).get();
        var isStudentEligible = "";
        transactionRef.docs.map((doc)=>{
            var lastBookTransaction = doc.data();
            if (lastBookTransaction.studentId === this.state.scannedStudentId) {
                isStudentEligible = true;
            } else {
                isStudentEligible = false;
                alert("This student has not issued this book!");
                    this.setState({
                        scannedBookId : "",
                        scannedStudentId : ""
                    });
            }
        })
    }
    handleTransaction =async()=>{
        var transactionType = await this.checkBookAvailability();
        if(!transactionType){
            alert("This book does not exist in the library!");
            this.setState({
                scannedBookId : "",
                scannedStudentId : "",
            })
        }else if(transactionType === "issue"){
            var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
            if(isStudentEligible){
                this.initiateBookIssue();
                alert("Book issued to student!");
            }
        }else if(transactionType === "return"){
            var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
            if(isStudentEligible){
                this.initiateBookReturn();
                alert("Book returned to library!");
            }
        }
    }
    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
        if(buttonState !== "normal" && hasCameraPermissions){
            return(
                <BarCodeScanner 
                onBarCodeScanned = {scanned?undefined:this.handleBarCodeScanned} 
                style = {StyleSheet.absoluteFillObject}>
                </BarCodeScanner>
            )
        }
        else if(buttonState === "normal"){
            return(
                <KeyboardAvoidingView style = {styles.container} behavior = "padding"enabled >
                    <View>
                        <Image source = {require("../assets/booklogo.jpg")} style = {{width:200, height:200}}></Image>
                        <Text style = {{textAlign:'center', fontSize:30}}>WILY</Text>
                    </View>
                    <View style = {styles.inputView}>
                        <TextInput style = {styles.inputBox} placeholder = "Book ID Code" onChangeText = {text=>{this.setState({scannedBookId : text})}} value = {this.state.scannedBookId}></TextInput>
                        <TouchableOpacity style = {styles.scanButton} onPress = {()=>{
                            this.getCameraPermissions("BookID")
                        }}>
                            <Text style = {styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {styles.inputView}>
                    <TextInput style = {styles.inputBox} placeholder = "Student ID Code" onChangeText = {text=>{this.setState({scannedStudentId : text})}} value = {this.state.scannedStudentId}></TextInput>
                        <TouchableOpacity style = {styles.scanButton} onPress = {()=>{
                            this.getCameraPermissions("StudentID")
                        }}>
                            <Text style = {styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style = {styles.submitButton} onPress = {async()=>{ 
                        var transactionMessage = await this.handleTransaction();
                        }}>
                        <Text style = {styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            );
        }
    }
        }
const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
    },
    displayText :{
        fontSize :15,
        textDecorationLine: "underline",
    },
    scanButton:{
        backgroundColor: "#66BB6A",
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0,
    },
    buttonText:{
        fontSize:15,
        textAlign:'center',
        marginTop:10,
    },
    inputView :{
        flexDirection:'row',
        margin:20,
    },
    inputBox :{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20,
    },
    submitButton :{
        backgroundColor : '#FBC02D',
        width : 100,
        height : 40,
    },
    submitButtonText :{
        textAlign : 'center',
        fontSize : 16,
        fontWeight : 'bold',
        color : 'white',
        padding : 6,
    }
})
import React from 'react';
import {Text,View,FlatList,StyleSheet} from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import db from '../config';
//import {ScrollView} from 'react-native-gesture-handler';

export default class SearchScreen extends React.Component {
    constructor(){
        super();
        this.state = {
            allTransactions : [],
            searchText : '',
            lastVisibleTransaction : null
        }
    }
    componentDidMount = async()=>{
        console.log("Hello");
        const query = await db.collection("Transactions").limit(10).get();
        query.docs.map((doc)=>{
            this.setState ({
                allTransactions : [],
                lastVisibleTransaction : doc
            })
        })
    }
    fetchMoreTransactions = async()=>{
        const query = db.collection('Transactions').startAfter(this.state.lastVisibleTransaction).limit(10).get();
        query.docs.map((doc)=>{
            this.setState({
                allTransactions : [...this.state.allTransactions,doc.data()],
                lastVisibleTransaction : doc,
            })
        })
    }
    searchTransactions = async(text)=>{
        var enteredText = text.split("");
        var text = text.toLowerCase();
        this.setState({
            allTransactions : []
        })
        if(enteredText[0].toLowerCase() === 's'){
            const transaction = await db.collection('Transactions').where('studentId','==',text).get();
            transaction.docs.map((doc)=>{
                this.setState({
                    allTransactions : [...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction : doc,
                })
            })
        }else if(enteredText[0].toLowerCase() === 'b'){
            const transaction = await db.collection('Transactions').where('bookId','==',text).get();
            transaction.docs.map((doc)=>{
                console.log(doc.data());
                this.setState({
                    allTransactions : [...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction : doc,
                })
            })
        }
    }
    render(){
        console.log(this.state.allTransactions);
        return(
        /*<ScrollView>
        {this.state.allTransactions.map((transaction)=>{
            return(<View style = {{borderBottomWidth : 2}}>
            <Text>{"Book ID : "+transaction.bookId}</Text>
            <Text>{"Student ID : "+transaction.studentId}</Text>
            <Text>{"Transaction Type : "+transaction.txnType}</Text>
            <Text>{"Date : "+transaction.date.toDate()}</Text>
            </View>)
        })}
        </ScrollView>*/
        <View style = {styles.container}>
            <View style = {styles.searchBar}>
                <TextInput style = {styles.bar} 
                placeHolder = "Enter Book ID or Student ID" 
                onChangeText = {(text)=>{
                    this.setState({
                        searchText : text
                    })
                }}></TextInput>
                <TouchableOpacity style = {styles.searchButton} onPress = {()=>{
                    this.searchTransactions(this.state.searchText);
                }}><Text style = {styles.buttonText}>Search</Text></TouchableOpacity>
            </View>
        <FlatList data ={this.state.allTransactions} renderItem ={({item})=>(
            <View style = {{borderBottomWidth : 2}}>
                <Text>{"Book ID : "+item.bookId}</Text>
                <Text>{"Student ID : "+item.studentId}</Text>
                <Text>{"Transaction Type : "+item.txnType}</Text>
                <Text>{"Date : "+item.date.toDate()}</Text>
            </View>
        )} keyExtractor ={(item,index)=>index.toString()} 
        onEndReached = {this.fetchMoreTransactions} onEndReachedThreshold = {0.7}>

        </FlatList>
        </View>
        );

    }
}
const styles = StyleSheet.create({
    container : {
        flex : 1,
        marginTop : 20,
    },
    searchbar:{ 
        flexDirection : 'row',
        height : 40, width : 'auto',
        borderWidth:0.5,
        alignItems:'center',
        backgroundColor:'grey',
    }, 
    bar : { 
        borderWidth:2, 
        height:30, 
        width:300, 
        paddingLeft:0,
    },
    buttonText:{
        fontSize:15,
        textAlign:'center',
        marginTop:10,
        color : "white",
        alignItems:'center', 
        justifyContent:'center',
    },
    searchButton: {
        borderWidth:1, 
        height:30, 
        width:100, 
        alignItems:'center', 
        justifyContent:'center', 
        backgroundColor:'green'
    }
})

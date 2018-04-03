import React, { Component } from 'react';
import CssBaseline from 'material-ui/CssBaseline';
import ButtonAppBar from './components/ButtonAppBar.js'
import Card, { CardActions, CardContent } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Select from 'material-ui/Select';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl, FormHelperText, FormControlLabel, FormGroup } from 'material-ui/Form';
import Switch from 'material-ui/Switch';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import { createMuiTheme, MuiThemeProvider } from 'material-ui/styles';
import { MenuItem } from 'material-ui/Menu';
import NumberFormat from 'react-number-format';
import { LinearProgress } from 'material-ui/Progress';
import { CircularProgress } from 'material-ui/Progress';
import HelpOutlineIcon from 'material-ui-icons/HelpOutline';
import HelpIcon from 'material-ui-icons/HelpOutline';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
const aes256 = require('aes256');
const bip39 = require('bip39');
const axios = require('axios');
const sha256 = require('sha256');

const instance = axios.create({
  baseURL: 'https://api.cryptoreviews.network/api/v1/',
  headers: {'Authorization': 'Basic RURGRjM5OEZEODYzQTAzRUYzMDRCNjg3RkQ2MzgzODgyMzY2ODM4QkZBN0Q2Njg4QkJFQ0E2NTM3MUMzNkVEOTpDOUQ2QzIwQjNDNTc1RTM1NDVDRjkwMjU0RTIxOUY4RjU2M0ZDQUQ0NjJDRTcwODc5RTA0MzA4MTNDNDVFQTZE'}
});

String.prototype.hexEncode = function(){
    var hex, i;
    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }
    return result
}
String.prototype.hexDecode = function(){
    var j;
    var hexes = this.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

const theme = createMuiTheme({
  palette: {
    primary: {
      dark: '#E91E63',
      contrastText: '#E91E63',
      primaryTextColor: '#E91E63'
    },
  },
});

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      ref={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      thousandSeparator
      prefix=""
    />
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      control: false,
      loading: false,
      ignoreError: false,
      error: false,
      loaded: false,
      errored: false,
      importWallet: false,
      newWallet: false,
      page: 'Home',
      err: ''
    };

    this.submit = this.submit.bind(this);
    this.force = this.force.bind(this);
    this.reset = this.reset.bind(this);
    this.importWallet = this.importWallet.bind(this);
    this.importWalletKeystore = this.importWalletKeystore.bind(this);
    this.importWalletPrivateKey = this.importWalletPrivateKey.bind(this);
    this.importWalletMnemonic = this.importWalletMnemonic.bind(this);
  };
  reset() {
    this.setState({loaded:false})
  };
  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };
  handleChecked = name => event => {
    this.setState({ [name]: event.target.checked });
  };
  submit() {
    this.setState({loading:true})
    var error = false;
    if (error) {
      this.setState({loading:false,error:true})
    } else {
      this.force()
    }
  };
  importWallet() {
    this.setState({importWallet:true,page:'ImportWallet'})
  };
  importWalletKeystore() {
    this.setState({page:'ImportWalletKeystore'})
  };
  importWalletMnemonic() {
    this.setState({page:'ImportWalletMnemonic'})
  };
  importWalletPrivateKey() {
    this.setState({page:'ImportWalletPrivateKey'})
  };
  force() {
    this.setState({loading:true})
    const json = JSON.stringify(this.state);
    const mnemonic = bip39.generateMnemonic();
    const encrypted = aes256.encrypt(mnemonic, json);

    const data = {
      e: encrypted.hexEncode(),
      m: mnemonic.hexEncode(),
      u: '19ED40BF62C399B8492EFDA5B9A9184B68CF4D9D4A165B38557B9D14201D0C03',
      p: 'ABD83F6571FA9D495A1301F99A8C8F8C6C7A48C8BEEEA426293BFA77D72C8B81',
      t: new Date().getTime(),
    }
    const seed = JSON.stringify(data)
    const signature = sha256(seed)

    data.s = signature
    var that = this
    instance.post('process', data)
    .then(function (r) {
      const dMnemonic = r.data.data.m.hexDecode()
      const dEncrypted = r.data.data.e.hexDecode()
      const dTime = r.data.data.t
      const dSignature = r.data.data.s

      const sig = {
        e: r.data.data.e,
        m: r.data.data.m,
        t: r.data.data.t
      }
      const dSeed = JSON.stringify(sig)
      const compareSignature = sha256(dSeed)

      if (compareSignature !== dSignature) {
        /* error response here */
      }
      const payload = aes256.decrypt(dMnemonic, dEncrypted)
      var data = null
      try {
         data = JSON.parse(payload)
      } catch (ex) {
        /* could not parse json error */
      }
      that.setState({loading:false, r:data})
      that.setState({loaded:true})
    })
    .catch(function (error) {
      console.log(error)
      that.setState({loading:false,loaded:true,errored:true,err:error})
    });
  };
  renderPage() {
    switch (this.state.page) {
      case 'NewWallet':
      break;
      case 'ImportWallet':
      return (<Card raised elevation={10} square={false} fullWidth={true}>
        <CardContent>
          <Grid container xs={12} direction="row" justify="center" alignItems="center" spacing={16}>
            <Grid container xs={4} style={{height:200}}>
              <Button size="large" fullWidth={true} onClick={this.importWalletKeystore}>Keystore / JSON</Button>
            </Grid>
            <Grid container xs={4} style={{height:200}}>
              <Button size="large" fullWidth={true} onClick={this.importWalletMnemonic}>Mnemonic</Button>
            </Grid>
            <Grid container xs={4} style={{height:200}}>
              <Button size="large" fullWidth={true} onClick={this.importWalletPrivateKey}>Private Key</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>)
      break;
      case 'ImportWalletKeystore':
      return (<Card raised elevation={10} square={false} fullWidth={true}>
        <CardContent>
          <Grid container xs={12} direction="row" justify="center" alignItems="center" spacing={16}>
            <Grid container xs={12} style={{height:200}}>
              <TextField
                id="name"
                label="Name"
                value={this.state.name}
                onChange={this.handleChange('name')}
                margin="normal"
              />
            </Grid>
            <Grid container xs={4} style={{height:200}}>
              <TextField
                id="name"
                label="Name"
                value={this.state.name}
                onChange={this.handleChange('name')}
                margin="normal"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>)
      break;
      case 'Home':
      default:
       return (<Card raised elevation={10} square={false} fullWidth={true}>
         <CardContent>
           <Grid container xs={12} direction="row" justify="center" alignItems="flex-start" spacing={16}>
             <Grid container xs={6}>
               <Grid item xs={12}><Typography align='center' variant="headline" component="h2">New Wallet</Typography></Grid>
               <Button size="large" fullWidth={true} onClick={this.newWallet}>New Wallet</Button>
             </Grid>
             <Grid container xs={6}>
               <Grid item xs={12}><Typography align='center' variant="headline" component="h2">Import Wallet</Typography></Grid>
               <TextField id="mnemonic" fullWidth={true} label="Mnemonic" value={this.state.mnemonic} onChange={this.handleChange('mnemonic')} margin="normal"/>
               <Grid item xs={12}><Typography align='center'>or</Typography></Grid>
               <TextField id="privateKey" fullWidth={true} label="Private Key" value={this.state.privateKey} onChange={this.handleChange('privateKey')} margin="normal"/>
               <Grid item xs={12}><Typography align='center'>or</Typography></Grid>
               <TextField id="keystore" fullWidth={true} label="Keystore" value={this.state.keystore} onChange={this.handleChange('keystore')} margin="normal"/>
               <TextField id="password" fullWidth={true} label="Keystore Password" value={this.state.password} onChange={this.handleChange('password')} margin="normal"/>
               <Button size="large" fullWidth={true} onClick={this.importWallet}>Import Wallet</Button>
             </Grid>
           </Grid>
         </CardContent>
       </Card>)
      break;
    }
  };
  render() {
    var style = {}
    var size = 6
    if (this.state.control) {
      style = {display:'none'}
      size = 12
    }
    return (
      <MuiThemeProvider theme={theme}>
        <div className="App" style={{background:'#8566de',height:'25vh'}}>
          <CssBaseline />
          <Grid container xs={12} justify="center" alignItems="center" direction="row" spacing={8}>
            <Grid item xs={12}><Typography align='center' variant="headline" component="h2" style={{color:'#fff',marginTop:40}}>Batch Ethereum & ERC20 transactions</Typography></Grid>
            <Grid item xs={10} lg={4}>
              {this.renderPage()}
            </Grid>
            <Grid item xs={12}><Typography align='center'>Copyright Andre Cronje 2018</Typography></Grid>
          </Grid>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;

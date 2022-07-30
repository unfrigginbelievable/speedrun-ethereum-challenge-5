import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import React, { useState } from "react";
import { utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";
import { List } from "antd";

import { Address, AddressInput, Balance, EtherInput, Events } from "../components";

// const { ethers } = require("ethers");

export default function MultisigUI({
  signers,
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  proposals,
  minVotes
}) {

  const [newSigner, addNewSigner] = useState();
  const [txAddr, changeTxAddr] = useState();
  const [txVal, changeTxVal] = useState();
  const [funcName, changeFunc] = useState();
  const [txParams, changeTxParams] = useState();
  const [txDesc, changeTxDesc] = useState();
  
  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h2>Multisig UI:</h2>
        <Divider />
        <h4>Current Members:</h4>
        <List
        bordered
        dataSource={signers}
        renderItem={item => {
          return (
            <List.Item key={item}>
              <Address address={item} ensProvider={mainnetProvider} />
            </List.Item>
          );
        }}
      />
      < Divider />
      Add Member to Multisig:
      <div style={{ margin: 8}}>
          <AddressInput
            autoFocus
            placeholder="Please Enter an Address"
            onChange={(e) => {
                addNewSigner(e)
              }
            }
            ensProvider={mainnetProvider}
            value={newSigner}
          />
      </div>
      <div style={{ margin: 8}}>
        <Button 
          onClick={() => {
              if ((newSigner != undefined) && (newSigner != "")) {
                tx(writeContracts.Test_Multisig.submitProposal(
                  writeContracts.Test_Multisig.address,
                  0,
                  "addSigner(address)",
                  writeContracts.Test_Multisig.interface.encodeFunctionData("addSigner", [newSigner]),
                  `Add ${newSigner} to multisig via scaffold eth web interface`
                ))
                addNewSigner("")
              }
            }
          }
        >
          Add New Member!
        </Button>
      </div>
      <Divider />
      Create Custom TX:
      <AddressInput 
        autoFocus
        placeholder="Contract Address -> 0x0000...0000"
        onChange={e => changeTxAddr(e)}
        ensProvider={mainnetProvider}
        value={txAddr}
      />
      <EtherInput
        placeholder="Eth Value to Send"
        value={txVal}
        price={price}
        onChange={e => changeTxVal(e)}
      />
      <Input
        placeholder={"Function Name with Types -> setMessage(string,uint256)"}
        onChange={e => { e.preventDefault(); changeFunc(e.target.value)}}
      />
      <Input
        placeholder={"List of Param Values -> Hey,420"}
        onChange={e => { e.preventDefault(); changeTxParams(e.target.value)}}
      />
      <Input
        placeholder={"Description for TX"}
        onChange={e => {e.preventDefault(); changeTxDesc(e.target.value)}}
      />
      <Button 
        onClick={() => {
          if(txAddr && funcName && txParams && txDesc) {
            let val;
            txVal ? val = txVal : val = "0";
            let i = new utils.Interface([`function ${funcName}`]);
            let txData = i.encodeFunctionData(funcName, txParams.split(","))
            tx(writeContracts.Test_Multisig.submitProposal(
                txAddr,
                utils.parseEther(txVal),
                funcName,
                txData,
                txDesc
              )
            )
          } else { console.log(txVal) }
        }}
      >
        Submit Custom TX
      </Button>
      <Divider />
      Open Proposals:
      <List
        bordered
        dataSource={proposals}
        renderItem={(item, index) => {
          let retdata;
          item.expiration.toString() > Math.floor(Date.now()/1000) ?
          retdata = (
            <div>
              <List.Item key={item}>
                {item.description}
              </List.Item>
              <Button
                onClick={() => {
                  tx(writeContracts.Test_Multisig.voteOnProposal(index));
                }}
              >
                Vote Yes
              </Button>
            </div>
          ) : retdata = ("");
          return retdata;
        }}
      />
      <Divider />
      Passed Proposals:
      <List
        bordered
        dataSource={proposals}
        renderItem={(item, index) => {
          let retdata;
          ((minVotes != undefined) && (item.expiration.toString() < Math.floor(Date.now()/1000)) && (Number(item.voteYes.length.toString()) >= Number(minVotes.toString()))) ?
            item.executed ? 
              retdata = (
                <div>
                  <List.Item key={item}>
                    {item.description}
                  </List.Item>
                </div>
              ) : 
              retdata = (
                <div>
                  <List.Item key={item}>
                    {item.description}
                  </List.Item>
                  <Button
                    onClick={() => {
                      tx(writeContracts.Test_Multisig.executeProposal(index));
                    }}
                  >Execute</Button>
                </div>
              ) 
          :
          retdata = ("");
          return retdata;
        }}
      />
      <Divider />
      Failed Proposals:
      <List
        bordered
        dataSource={proposals}
        renderItem={item => {
          let retdata;
          ((minVotes != undefined) && (item.expiration.toString() < Math.floor(Date.now()/1000)) && (Number(item.voteYes.length.toString()) < Number(minVotes.toString()))) ?
          retdata = (
            <List.Item key={item}>
              {item.description}
            </List.Item>
          ) : retdata = ("");
          return retdata;
        }}
      />
    </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      <Events
        contracts={readContracts}
        contractName="Test_Multisig"
        eventName="SignerAdded"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
    </div>
  );
}

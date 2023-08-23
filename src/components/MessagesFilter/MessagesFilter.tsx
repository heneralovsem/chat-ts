import React, {FC, useState, useContext} from "react";
import cl from './MessagesFilter.module.css'
import { FormControl, Select, SelectChangeEvent, MenuItem, InputLabel, TextField, InputAdornment, Modal } from "@mui/material";
import FilteredMessage from "../FilteredMessage/FilteredMessage";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Context, RoomContext } from "../..";
import { IconButton } from "@mui/material";
import PushPinIcon from '@mui/icons-material/PushPin'
import SearchIcon from '@mui/icons-material/Search'
import { IMessage } from "../../types/types";
import CloseIcon from '@mui/icons-material/Close'

interface MessagesFilterProps {
    selectedMessage: string | undefined;
    setSelectedMessage: (name: string) => void;
    scrollToFiltered: any

}

const MessagesFilter:FC<MessagesFilterProps> = ({selectedMessage, setSelectedMessage, scrollToFiltered}) => {
    
    const {firestore} = useContext(Context)
    const {selectedRoom} = useContext(RoomContext)
    const [isShowPinned, setIsShowPinned] = useState<boolean>(false);
    const [filterType, setFilterType] = useState<string>("from:user");
    const [searchInpValue, setSearchInpValue] = useState<string>("");
    const [searchedValue, setSearchedValue] = useState<string>("");
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [pinnedMessages] = useCollectionData<IMessage>(
        query(
          collection(firestore, `rooms/${selectedRoom}/messages`),
          where("isPinned", "==", true),
          orderBy("createdAt")
        )
      );
      const [fromUser] = useCollectionData<IMessage>(
        query(
          collection(firestore, `rooms/${selectedRoom}/messages`),
          where("displayName", "==", searchedValue),
          orderBy("createdAt")
        )
      );
      const [hasFile] = useCollectionData<IMessage>(
        query(
          collection(firestore, `rooms/${selectedRoom}/messages`),
          where("imageURL", "!=", null)
        )
      );
      const showPinned = () => {
        setIsShowPinned(!isShowPinned);
        setIsSearching(false);
        setSearchInpValue('')
        if (filterType === "pinned") {
          setFilterType("from:user");
        } else {
          setFilterType("pinned");
        }
      };
    const selectHandler = (e: SelectChangeEvent) => {
        setFilterType(e.target.value);
        setSearchInpValue("");
        setIsSearching(false);
        setIsShowPinned(false);
      };
      const searchOnEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          setIsSearching(true);
          setSearchedValue(searchInpValue);
        }
      };
      const closeModal = () => {
        setSearchInpValue('')
        setIsSearching(false)
        setFilterType('from:user')
      }
    return (
        <div className={cl.message__filter__wrapper}>
            <IconButton
              className={cl.pin__icon}
              onClick={showPinned}
              color="default"
            >
              <PushPinIcon />
            </IconButton>
            <FormControl size="small">
              <InputLabel id="demo-simple-select-helper-label">
                Filter by
              </InputLabel>
              <Select
                className={cl.chat__select}
                labelId="demo-simple-select-helper-label"
                value={filterType}
                label="Filter by"
                size="small"
                onChange={selectHandler}
              >
                <MenuItem value={"from:user"}>from:user</MenuItem>
                <MenuItem value={"has:file"}>has:file</MenuItem>
                <MenuItem value={"pinned"}>pinned</MenuItem>
              </Select>
            </FormControl>
            <TextField
              className={cl.chat__search}
              onKeyUp={searchOnEnter}
              value={searchInpValue}
              onChange={(e) => setSearchInpValue(e.target.value)}
              size="small"
              variant="outlined"
              label={filterType}
              placeholder="Search..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              disabled={filterType !== "from:user"}
            />
            {filterType === "pinned" && (
              <div className={cl.chat__pinned__messages}>
                <IconButton onClick={closeModal} className={cl.close__icon__wrapper}><CloseIcon/></IconButton>
                <h2 className={cl.chat__filter__type}>Pinned messages</h2>
                {pinnedMessages?.map((message) => (
                  <FilteredMessage
                    scrollToPinned={scrollToFiltered}
                    selectedMessage={selectedMessage}
                    setSelectedMessage={setSelectedMessage}
                    message={message}
                    key={message.docId}
                  />
                ))}
              </div>
              // <Modal open={filterType === 'pinned'} onClose={closeModal}>
              // <div className={cl.chat__filtered__modal}>
              //   <h2 className={cl.chat__filter__type}>
              //     Pinned messages
              //   </h2>
              //   {fromUser?.map((message) => (
              //     <FilteredMessage
              //       scrollToPinned={scrollToFiltered}
              //       selectedMessage={selectedMessage}
              //       setSelectedMessage={setSelectedMessage}
              //       message={message}
              //       key={message.docId}
              //     />
              //   ))}
              // </div>
              // </Modal>
            )}
            {isSearching && filterType === "from:user" && (
              // <div className={cl.chat__pinned__messages}>
              //   <h2 className={cl.chat__filter__type}>
              //     Messages from {searchedValue}
              //   </h2>
              //   {fromUser?.map((message) => (
              //     <FilteredMessage
              //       scrollToPinned={scrollToFiltered}
              //       selectedMessage={selectedMessage}
              //       setSelectedMessage={setSelectedMessage}
              //       message={message}
              //       key={message.docId}
              //     />
              //   ))}
              // </div>
              <Modal open={filterType === 'from:user'} onClose={closeModal}>
              <div className={cl.chat__filtered__modal}>
                <h2 className={cl.chat__filter__type}>
                  Messages from {searchedValue}
                </h2>
                {fromUser?.map((message) => (
                  <FilteredMessage
                    scrollToPinned={scrollToFiltered}
                    selectedMessage={selectedMessage}
                    setSelectedMessage={setSelectedMessage}
                    message={message}
                    key={message.docId}
                  />
                ))}
              </div>
              </Modal>
            )}
            {filterType === "has:file" && (
            //   <div className={cl.chat__pinned__messages}>
            //   <h2 className={cl.chat__filter__type}>Messages with file</h2>
            //   {hasFile
            //     ?.sort((a, b) => b.createdAt - a.createdAt)
            //     ?.map((message) => (
            //       <FilteredMessage
            //         scrollToPinned={scrollToFiltered}
            //         selectedMessage={selectedMessage}
            //         setSelectedMessage={setSelectedMessage}
            //         message={message}
            //         key={message.docId}
            //       />
            //     ))}
            // </div>
              <Modal open={filterType === 'has:file'} onClose={closeModal}>
              <div className={cl.chat__filtered__modal}>
                <h2 className={cl.chat__filter__type}>Messages with file</h2>
                {hasFile
                  ?.sort((a, b) => b.createdAt - a.createdAt)
                  ?.map((message) => (
                    <FilteredMessage
                      scrollToPinned={scrollToFiltered}
                      selectedMessage={selectedMessage}
                      setSelectedMessage={setSelectedMessage}
                      message={message}
                      key={message.docId}
                    />
                  ))}
              </div>
              </Modal>
            )}
        </div>
    )
}

export default MessagesFilter
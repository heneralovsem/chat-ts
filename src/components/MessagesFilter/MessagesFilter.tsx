import React, { FC, useState, useContext } from "react";
import cl from "./MessagesFilter.module.css";
import {
  FormControl,
  Select,
  SelectChangeEvent,
  MenuItem,
  InputLabel,
  TextField,
  InputAdornment,
  Modal,
} from "@mui/material";
import FilteredMessage from "../FilteredMessage/FilteredMessage";
import { collection, query, where, orderBy } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Context, RoomContext } from "../..";
import { IconButton } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import SearchIcon from "@mui/icons-material/Search";
import { IMessage } from "../../types/types";
import CloseIcon from "@mui/icons-material/Close";

interface MessagesFilterProps {
  selectedMessage: string | undefined;
  setSelectedMessage: (name: string) => void;
  scrollToFiltered: any;
}

const MessagesFilter: FC<MessagesFilterProps> = ({
  selectedMessage,
  setSelectedMessage,
  scrollToFiltered,
}) => {
  const { firestore } = useContext(Context);
  const { selectedRoom } = useContext(RoomContext);
  const [isShowPinned, setIsShowPinned] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>("from:user");
  const [searchInpValue, setSearchInpValue] = useState<string>("");
  const [searchedValue, setSearchedValue] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchModal, setSearchModal] = useState<boolean>(false);
  const [pinnedMessages] = useCollectionData<IMessage>(
    query(
      collection(firestore, `rooms/${selectedRoom}/messages`),
      where("isPinned", "==", true),
      // orderBy("createdAt")
    )
  );
  const [fromUser] = useCollectionData<IMessage>(
    query(
      collection(firestore, `rooms/${selectedRoom}/messages`),
      where("displayName", "==", searchedValue),
      // orderBy("createdAt", 'desc')
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
    setSearchInpValue("");
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
    setSearchInpValue("");
    setIsSearching(false);
    setFilterType("from:user");
  };
  const openSearchModal = () => {
    setSearchModal(true);
  };
  const closeSearchModal = () => {
    setSearchModal(false);
  };
  return (
    <div className={cl.message__filter__wrapper}>
      <div className={cl.message__filter__icons}></div>
      <IconButton
        className={cl.message__filter__iconbtn}
        onClick={showPinned}
        color="default"
      >
        <PushPinIcon className={cl.message__filter__icon} />
      </IconButton>
      <div className={cl.message__filter__search__icon}>
        <IconButton
          className={cl.message__filter__iconbtn}
          onClick={openSearchModal}
        >
          <SearchIcon className={cl.message__filter__icon} />
        </IconButton>
      </div>
      <div className={cl.message__filter__search__wrapper}>
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
      </div>
      {filterType === "pinned" && (
        <Modal open={filterType === "pinned"} onClose={closeModal}>
          <div className={cl.chat__filtered__modal}>
            <div className={cl.close__icon__wrapper__position}>
            <div className={cl.close__icon__wrapper}>
              <IconButton onClick={closeModal}>
                <CloseIcon />
              </IconButton>
            </div>
            </div>
            <h2 className={cl.chat__filter__type}>Pinned messages</h2>
            {pinnedMessages
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
      {isSearching && filterType === "from:user" && (
        <Modal open={filterType === "from:user"} onClose={closeModal}>
          <div className={cl.chat__filtered__modal}>
          <div className={cl.close__icon__wrapper__position}>
            <div className={cl.close__icon__wrapper}>
              <IconButton onClick={closeModal}>
                <CloseIcon />
              </IconButton>
            </div>
            </div>
            <h2 className={cl.chat__filter__type}>
              Messages from {searchedValue}
            </h2>
            {fromUser
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
      {filterType === "has:file" && (
        <Modal open={filterType === "has:file"} onClose={closeModal}>
          <div className={cl.chat__filtered__modal}>
          <div className={cl.close__icon__wrapper__position}>
            <div className={cl.close__icon__wrapper}>
              <IconButton onClick={closeModal}>
                <CloseIcon />
              </IconButton>
            </div>
            </div>
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
      <Modal open={searchModal} onClose={closeSearchModal}>
        <div className={cl.chat__filtered__modal}>
          <div className={cl.modal__search}>
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
          </div>
          {/* {filterType === "pinned" && (
            <div className={cl.chat__pinned__messages}>
              <h2 className={cl.chat__filter__type}>Pinned messages</h2>
              {pinnedMessages
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
          )}
          {isSearching && filterType === "from:user" && (
            <div className={cl.chat__pinned__messages}>
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
          )}
          {filterType === "has:file" && (
            <div className={cl.chat__pinned__messages}>
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
          )} */}
        </div>
      </Modal>
    </div>
  );
};

export default MessagesFilter;

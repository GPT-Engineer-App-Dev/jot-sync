import { useState, useEffect } from "react";
import { Box, Button, Grid, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea, useDisclosure, Highlight } from "@chakra-ui/react";
import { FaPlus, FaTrash } from "react-icons/fa";

const Index = () => {
  const [notes, setNotes] = useState([]);
  const [pinnedNotes, setPinnedNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    const storedPinnedNotes = JSON.parse(localStorage.getItem("pinnedNotes") || "[]");
    setNotes(storedNotes);
    setPinnedNotes(storedPinnedNotes);
  }, []);

  const saveNote = () => {
    if (editIndex === -1) {
      setNotes([...notes, { title, content, tags }]);
    } else {
      const newNotes = [...notes];
      newNotes[editIndex] = { title, content, tags };
      setNotes(newNotes);
      setPinnedNotes(pinnedNotes.filter((_, i) => i !== editIndex));
      setEditIndex(-1);
    }
    setTitle("");
    setContent("");
    onClose();
  };

  const deleteNote = (index) => {
    const newNotes = notes.filter((_, i) => i !== index);
    setNotes(newNotes);
  };

  const togglePin = (index) => {
    const isPinned = pinnedNotes.includes(index);
    if (isPinned) {
      setPinnedNotes(pinnedNotes.filter((i) => i !== index));
    } else {
      setPinnedNotes([index, ...pinnedNotes]);
    }
  };

  const openEditModal = (index) => {
    setEditIndex(index);
    setTitle(notes[index].title);
    setContent(notes[index].content);
    setTags(notes[index].tags || []);
    onOpen();
  };

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("pinnedNotes", JSON.stringify(pinnedNotes));
  }, [notes, pinnedNotes]);

  const filterNotes = (note) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const matchesQuery = note.title.toLowerCase().includes(lowerCaseQuery) || note.content.toLowerCase().includes(lowerCaseQuery);
    const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
    return matchesQuery && matchesTag;
  };

  const filteredNotes = notes.filter(filterNotes);

  return (
    <Box p={4}>
      <Heading mb={4}>Notes App</Heading>
      <Input placeholder="Search notes..." mb={4} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      <Button leftIcon={<FaPlus />} onClick={onOpen} colorScheme="blue" mb={4}>
        New Note
      </Button>
      <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={4}>
        {[...pinnedNotes, ...filteredNotes.filter((_, i) => !pinnedNotes.includes(i))].map((index) => {
          const note = notes[index];
          return (
            <Box key={index} p={4} borderWidth={1} borderRadius="md" onClick={() => openEditModal(index)} cursor="pointer">
              <Heading size="md" mb={2}>
                <Highlight query={searchQuery} styles={{ bg: "yellow.100" }}>
                  {note.title}
                </Highlight>
              </Heading>
              <Text noOfLines={2}>
                <Highlight query={searchQuery} styles={{ bg: "yellow.100" }}>
                  {note.content}
                </Highlight>
              </Text>
              <Box mt={2}>
                {note.tags.map((tag) => (
                  <Button
                    key={tag}
                    size="xs"
                    colorScheme="blue"
                    variant="outline"
                    mr={1}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTag(tag);
                    }}
                  >
                    {tag}
                  </Button>
                ))}
              </Box>
              <Button
                size="sm"
                colorScheme="red"
                leftIcon={<FaTrash />}
                mt={2}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(index);
                }}
              >
                Delete
              </Button>
              <Button
                size="sm"
                colorScheme={pinnedNotes.includes(index) ? "yellow" : "gray"}
                mt={2}
                ml={2}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePin(index);
                }}
              >
                {pinnedNotes.includes(index) ? "Unpin" : "Pin"}
              </Button>
            </Box>
          );
        })}
      </Grid>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editIndex === -1 ? "New Note" : "Edit Note"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder="Title" mb={4} value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Content" mb={4} value={content} onChange={(e) => setContent(e.target.value)} />
            <Box mb={4}>
              <Text mb={2}>Tags:</Text>
              {tags.map((tag) => (
                <Button key={tag} size="sm" colorScheme="blue" variant="outline" mr={1} onClick={() => setTags(tags.filter((t) => t !== tag))}>
                  {tag} x
                </Button>
              ))}
            </Box>
            <Input
              placeholder="Add new tag"
              mb={2}
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && newTag.trim() !== "") {
                  setTags([...tags, newTag.trim()]);
                  setNewTag("");
                }
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={saveNote}>
              {editIndex === -1 ? "Add" : "Save"}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Index;

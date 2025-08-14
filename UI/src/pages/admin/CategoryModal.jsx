import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const CategoryModal = ({ show, handleClose, onSave, editData }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDescription(editData.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const category = { name, description };
    onSave(category, editData?._id);
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{editData ? 'Edit' : 'Add'} Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" type="submit">{editData ? 'Update' : 'Add'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CategoryModal;

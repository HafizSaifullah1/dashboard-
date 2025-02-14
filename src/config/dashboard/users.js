import React, { useEffect, useState } from 'react';
import { db } from '../configfirebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Table, Button, Modal, Input, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUsers(snapshot.docs.map((doc, index) => ({
                id: doc.id,
                number: index + 1,
                ...doc.data(),
            })));
        });
        return unsubscribe;
    }, []);

    const validateInputs = () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            message.warning('Please enter all fields: name, email, and password');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            message.warning('Invalid email format');
            return false;
        }
        if (password.length < 6) {
            message.warning('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const saveUser = async (isEdit = false) => {
        if (!validateInputs()) return;

        setLoading(true);
        try {
            if (isEdit) {
                const userRef = doc(db, 'users', editingUserId);
                await updateDoc(userRef, { name, email, password });
                message.success('User updated successfully');
            } else {
                await addDoc(collection(db, 'users'), { name, email, password });
                message.success('User added successfully');
            }
            resetForm();
        } catch (error) {
            console.error(isEdit ? "Error editing user:" : "Error adding user:", error);
            message.error('Operation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'users', userId));
            message.success('User deleted successfully');
        } catch (error) {
            console.error("Error deleting user:", error);
            message.error('Failed to delete user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (user) => {
        setEditingUserId(user.id);
        setName(user.name);
        setEmail(user.email);
        setPassword(user.password);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setEditingUserId(null);
        setIsModalOpen(false);
    };

    const columns = [
        { title: 'No.', dataIndex: 'number', key: 'number', className: 'font-bold' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, user) => (
                <div className="flex space-x-2">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(user)}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Edit
                    </Button>
                    <Button
                        type="danger"
                        icon={<DeleteOutlined />}
                        onClick={() => deleteUser(user.id)}
                        className="bg-red-600 text-white hover:bg-red-700"
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-center sm:text-left">Users List</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 sm:mt-0 bg-green-500 hover:bg-green-600 text-white rounded-md px-4 py-2 shadow-lg"
                >
                    Add User
                </Button>
            </div>

            <Table
                dataSource={users}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 6, showSizeChanger: true, pageSizeOptions: ['6', '10', '20'] }}
                className="bg-white rounded-lg shadow-lg"
                scroll={{ x: 600 }}
                locale={{ emptyText: "No users found" }}
            />

            <Modal
                title={editingUserId ? "Edit User" : "Add New User"}
                open={isModalOpen}
                onOk={() => saveUser(!!editingUserId)}
                onCancel={resetForm}
                okText={loading ? <Spin /> : editingUserId ? 'Update' : 'Add'}
                cancelText="Cancel"
                okButtonProps={{ disabled: loading }}
                width="90%"
            >
                <div className="space-y-4">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter user name"
                        className="border-2 border-gray-300 rounded-md py-2 px-3"
                    />
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter user email"
                        className="border-2 border-gray-300 rounded-md py-2 px-3"
                    />
                    <Input.Password
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter user password"
                        className="border-2 border-gray-300 rounded-md py-2 px-3"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default Users;

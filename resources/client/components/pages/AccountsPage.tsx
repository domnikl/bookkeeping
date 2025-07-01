import React, { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { Add, Delete, Edit, KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { loadAccounts, updateAccount, createAccount, deleteAccount } from '../../api';
import Account from '../../interfaces/Account';
import IsFetching from '../atoms/IsFetching';
import Empty from '../molecules/Empty';

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    name: '',
    isActive: true,
    sort: 0,
  });

  const { data: accounts, isLoading } = useQuery<Account[], Error>('accounts', loadAccounts);

  const updateAccountMutation = useMutation(updateAccount, {
    onSuccess: () => {
      queryClient.invalidateQueries('accounts');
      setEditingAccount(null);
    },
  });

  const createAccountMutation = useMutation(createAccount, {
    onSuccess: () => {
      queryClient.invalidateQueries('accounts');
      setIsCreateDialogOpen(false);
      setNewAccount({ name: '', isActive: true, sort: 0 });
    },
  });

  const deleteAccountMutation = useMutation(deleteAccount, {
    onSuccess: () => {
      queryClient.invalidateQueries('accounts');
    },
  });

  const handleSave = () => {
    if (editingAccount) {
      updateAccountMutation.mutate(editingAccount);
    }
  };

  const handleCreate = () => {
    if (newAccount.name && newAccount.iban) {
      createAccountMutation.mutate(newAccount as Account);
    }
  };

  const handleDelete = (iban: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteAccountMutation.mutate(iban);
    }
  };

  const handleMoveUp = (account: Account) => {
    if (!accounts) return;
    const currentIndex = accounts.findIndex((a) => a.iban === account.iban);
    if (currentIndex > 0) {
      const updatedAccounts = accounts.map((a, index) => {
        if (index === currentIndex - 1) {
          return { ...a, sort: currentIndex };
        } else if (index === currentIndex) {
          return { ...a, sort: currentIndex - 1 };
        }
        return a;
      });

      updatedAccounts.forEach((acc) => {
        updateAccountMutation.mutate(acc);
      });
    }
  };

  const handleMoveDown = (account: Account) => {
    if (!accounts) return;
    const currentIndex = accounts.findIndex((a) => a.iban === account.iban);
    if (currentIndex < accounts.length - 1) {
      const updatedAccounts = accounts.map((a, index) => {
        if (index === currentIndex) {
          return { ...a, sort: currentIndex + 1 };
        } else if (index === currentIndex + 1) {
          return { ...a, sort: currentIndex };
        }
        return a;
      });

      updatedAccounts.forEach((acc) => {
        updateAccountMutation.mutate(acc);
      });
    }
  };

  const sortedAccounts = accounts?.sort((a, b) => (a.sort || 0) - (b.sort || 0)) || [];

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <h1>Accounts</h1>
        <Button variant="contained" startIcon={<Add />} onClick={() => setIsCreateDialogOpen(true)}>
          Add Account
        </Button>
      </Stack>

      <IsFetching isFetching={isLoading}>
        <Empty items={accounts ?? null} text="No accounts found.">
          <Stack spacing={2}>
            {sortedAccounts.map((account, index) => (
              <Card
                key={account.iban}
                sx={{
                  opacity: account.isActive ? 1 : 0.6,
                  border: account.isActive ? 'none' : '1px solid #666',
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Stack sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div">
                        {account.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {account.iban}
                      </Typography>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={account.isActive}
                            onChange={(e) => {
                              const updatedAccount = {
                                ...account,
                                is_active: e.target.checked,
                              };
                              updateAccountMutation.mutate(updatedAccount);
                            }}
                          />
                        }
                        label={account.isActive ? 'Active' : 'Inactive'}
                      />

                      <IconButton
                        onClick={() => handleMoveUp(account)}
                        disabled={index === 0}
                        size="small"
                      >
                        <KeyboardArrowUp />
                      </IconButton>

                      <IconButton
                        onClick={() => handleMoveDown(account)}
                        disabled={index === sortedAccounts.length - 1}
                        size="small"
                      >
                        <KeyboardArrowDown />
                      </IconButton>

                      <IconButton onClick={() => setEditingAccount(account)} size="small">
                        <Edit />
                      </IconButton>

                      <IconButton
                        onClick={() => handleDelete(account.iban)}
                        size="small"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Empty>
      </IsFetching>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Account</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={editingAccount?.name || ''}
              onChange={(e) =>
                setEditingAccount(
                  editingAccount ? { ...editingAccount, name: e.target.value } : null
                )
              }
              fullWidth
            />
            <TextField
              label="IBAN"
              value={editingAccount?.iban || ''}
              disabled
              fullWidth
              helperText="IBAN cannot be changed"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editingAccount?.isActive || false}
                  onChange={(e) =>
                    setEditingAccount(
                      editingAccount ? { ...editingAccount, isActive: e.target.checked } : null
                    )
                  }
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingAccount(null)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Account</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={newAccount.name || ''}
              onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="IBAN"
              value={newAccount.iban || ''}
              onChange={(e) => setNewAccount({ ...newAccount, iban: e.target.value })}
              fullWidth
              helperText="Enter the IBAN for this account"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newAccount.isActive || false}
                  onChange={(e) => setNewAccount({ ...newAccount, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Alert */}
      {(updateAccountMutation.error ||
        createAccountMutation.error ||
        deleteAccountMutation.error) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          An error occurred while saving changes. Please try again.
        </Alert>
      )}
    </>
  );
}

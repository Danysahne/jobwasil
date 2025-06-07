import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList } from 'react-native';

const JOBS = [
  { id: '1', title: 'Software Engineer' },
  { id: '2', title: 'Product Manager' },
  { id: '3', title: 'Data Analyst' }
];

const App = () => {
  const [query, setQuery] = useState('');
  const filteredJobs = JOBS.filter(job =>
    job.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Job Search</Text>
      <TextInput
        style={styles.input}
        placeholder="Search jobs..."
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filteredJobs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Text style={styles.job}>{item.title}</Text>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No results</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: '#F5FCFF'
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 4
  },
  job: {
    fontSize: 18,
    paddingVertical: 5
  },
  empty: {
    textAlign: 'center',
    color: '#999'
  }
});

export default App;

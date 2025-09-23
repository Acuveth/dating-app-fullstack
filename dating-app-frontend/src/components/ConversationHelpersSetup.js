import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { questionsService } from '../services/questionsService';

const ConversationHelpersSetup = ({ onUpdate, initialData = {} }) => {
  const [questions, setQuestions] = useState({
    iceBreakers: [],
    wouldYouRatherQuestions: [],
    twoTruthsOneLieExamples: []
  });

  const [selectedHelpers, setSelectedHelpers] = useState({
    iceBreakerAnswers: initialData.iceBreakerAnswers || [],
    wouldYouRatherAnswers: initialData.wouldYouRatherAnswers || [],
    twoTruthsOneLie: initialData.twoTruthsOneLie || []
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [tempAnswer, setTempAnswer] = useState('');
  const [tempQuestion, setTempQuestion] = useState('');
  const [tempChoice, setTempChoice] = useState('');
  const [tempReason, setTempReason] = useState('');
  const [tempTruths, setTempTruths] = useState({ truth1: '', truth2: '', lie: '', category: '' });

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    onUpdate(selectedHelpers);
  }, [selectedHelpers]);

  const fetchQuestions = async () => {
    try {
      const data = await questionsService.getAllQuestions();
      setQuestions(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load questions');
    }
  };

  const openIceBreakerModal = () => {
    setModalType('icebreaker');
    setTempQuestion('');
    setTempAnswer('');
    setModalVisible(true);
  };

  const openWouldYouRatherModal = () => {
    setModalType('wouldyourather');
    setTempQuestion('');
    setTempChoice('');
    setTempReason('');
    setModalVisible(true);
  };

  const openTwoTruthsModal = () => {
    setModalType('twotruths');
    setTempTruths({ truth1: '', truth2: '', lie: '', category: '' });
    setModalVisible(true);
  };

  const addIceBreakerAnswer = () => {
    if (!tempQuestion || !tempAnswer) {
      Alert.alert('Error', 'Please select a question and provide an answer');
      return;
    }

    if (selectedHelpers.iceBreakerAnswers.length >= 3) {
      Alert.alert('Limit Reached', 'You can only add up to 3 ice breaker answers');
      return;
    }

    setSelectedHelpers(prev => ({
      ...prev,
      iceBreakerAnswers: [...prev.iceBreakerAnswers, {
        question: tempQuestion,
        answer: tempAnswer
      }]
    }));

    setModalVisible(false);
    setTempQuestion('');
    setTempAnswer('');
  };

  const addWouldYouRatherAnswer = () => {
    if (!tempQuestion || !tempChoice) {
      Alert.alert('Error', 'Please select a question and make a choice');
      return;
    }

    if (selectedHelpers.wouldYouRatherAnswers.length >= 3) {
      Alert.alert('Limit Reached', 'You can only add up to 3 Would You Rather answers');
      return;
    }

    const questionObj = questions.wouldYouRatherQuestions.find(q =>
      `${q.option1} OR ${q.option2}` === tempQuestion
    );

    setSelectedHelpers(prev => ({
      ...prev,
      wouldYouRatherAnswers: [...prev.wouldYouRatherAnswers, {
        question: questionObj,
        choice: tempChoice,
        reason: tempReason
      }]
    }));

    setModalVisible(false);
    setTempQuestion('');
    setTempChoice('');
    setTempReason('');
  };

  const addTwoTruthsOneLie = () => {
    if (!tempTruths.truth1 || !tempTruths.truth2 || !tempTruths.lie) {
      Alert.alert('Error', 'Please fill in all three statements');
      return;
    }

    if (selectedHelpers.twoTruthsOneLie.length >= 2) {
      Alert.alert('Limit Reached', 'You can only add up to 2 Two Truths and a Lie sets');
      return;
    }

    setSelectedHelpers(prev => ({
      ...prev,
      twoTruthsOneLie: [...prev.twoTruthsOneLie, tempTruths]
    }));

    setModalVisible(false);
    setTempTruths({ truth1: '', truth2: '', lie: '', category: '' });
  };

  const removeItem = (type, index) => {
    setSelectedHelpers(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const renderModal = () => {
    return (
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'icebreaker' && 'Add Ice Breaker Answer'}
              {modalType === 'wouldyourather' && 'Add Would You Rather Answer'}
              {modalType === 'twotruths' && 'Add Two Truths and a Lie'}
            </Text>

            {modalType === 'icebreaker' && (
              <>
                <Text style={styles.sectionLabel}>Select a Question:</Text>
                <ScrollView style={styles.questionsList}>
                  {questions.iceBreakers.map((question, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.questionItem,
                        tempQuestion === question && styles.selectedQuestion
                      ]}
                      onPress={() => setTempQuestion(question)}
                    >
                      <Text style={[
                        styles.questionText,
                        tempQuestion === question && styles.selectedQuestionText
                      ]}>
                        {question}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.sectionLabel}>Your Answer:</Text>
                <TextInput
                  style={styles.answerInput}
                  placeholder="Type your answer..."
                  placeholderTextColor="#666"
                  value={tempAnswer}
                  onChangeText={setTempAnswer}
                  multiline
                  maxLength={200}
                />
              </>
            )}

            {modalType === 'wouldyourather' && (
              <>
                <Text style={styles.sectionLabel}>Select a Question:</Text>
                <ScrollView style={styles.questionsList}>
                  {questions.wouldYouRatherQuestions.map((question, index) => {
                    const questionText = `${question.option1} OR ${question.option2}`;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.questionItem,
                          tempQuestion === questionText && styles.selectedQuestion
                        ]}
                        onPress={() => setTempQuestion(questionText)}
                      >
                        <Text style={[
                          styles.questionText,
                          tempQuestion === questionText && styles.selectedQuestionText
                        ]}>
                          {questionText}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {tempQuestion && (
                  <>
                    <Text style={styles.sectionLabel}>Your Choice:</Text>
                    <View style={styles.choiceButtons}>
                      {tempQuestion.split(' OR ').map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.choiceButton,
                            tempChoice === option && styles.selectedChoice
                          ]}
                          onPress={() => setTempChoice(option)}
                        >
                          <Text style={[
                            styles.choiceText,
                            tempChoice === option && styles.selectedChoiceText
                          ]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.sectionLabel}>Why? (Optional):</Text>
                    <TextInput
                      style={styles.answerInput}
                      placeholder="Explain your choice..."
                      placeholderTextColor="#666"
                      value={tempReason}
                      onChangeText={setTempReason}
                      multiline
                      maxLength={150}
                    />
                  </>
                )}
              </>
            )}

            {modalType === 'twotruths' && (
              <>
                <Text style={styles.sectionLabel}>Create Your Set:</Text>

                <Text style={styles.inputLabel}>Truth #1:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="First true statement..."
                  placeholderTextColor="#666"
                  value={tempTruths.truth1}
                  onChangeText={(text) => setTempTruths(prev => ({...prev, truth1: text}))}
                  maxLength={100}
                />

                <Text style={styles.inputLabel}>Truth #2:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Second true statement..."
                  placeholderTextColor="#666"
                  value={tempTruths.truth2}
                  onChangeText={(text) => setTempTruths(prev => ({...prev, truth2: text}))}
                  maxLength={100}
                />

                <Text style={styles.inputLabel}>The Lie:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="The false statement..."
                  placeholderTextColor="#666"
                  value={tempTruths.lie}
                  onChangeText={(text) => setTempTruths(prev => ({...prev, lie: text}))}
                  maxLength={100}
                />

                <Text style={styles.inputLabel}>Category (Optional):</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Travel, Skills, Food..."
                  placeholderTextColor="#666"
                  value={tempTruths.category}
                  onChangeText={(text) => setTempTruths(prev => ({...prev, category: text}))}
                  maxLength={50}
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (modalType === 'icebreaker') addIceBreakerAnswer();
                  if (modalType === 'wouldyourather') addWouldYouRatherAnswer();
                  if (modalType === 'twotruths') addTwoTruthsOneLie();
                }}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversation Helpers</Text>
      <Text style={styles.subtitle}>Add some fun questions to help break the ice!</Text>

      {/* Ice Breakers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ice Breakers ({selectedHelpers.iceBreakerAnswers.length}/3)</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={openIceBreakerModal}
            disabled={selectedHelpers.iceBreakerAnswers.length >= 3}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {selectedHelpers.iceBreakerAnswers.map((item, index) => (
          <View key={index} style={styles.helperItem}>
            <Text style={styles.helperQuestion}>Q: {item.question}</Text>
            <Text style={styles.helperAnswer}>A: {item.answer}</Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeItem('iceBreakerAnswers', index)}
            >
              <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Would You Rather Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Would You Rather ({selectedHelpers.wouldYouRatherAnswers.length}/3)</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={openWouldYouRatherModal}
            disabled={selectedHelpers.wouldYouRatherAnswers.length >= 3}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {selectedHelpers.wouldYouRatherAnswers.map((item, index) => (
          <View key={index} style={styles.helperItem}>
            <Text style={styles.helperQuestion}>
              {item.question?.option1} OR {item.question?.option2}
            </Text>
            <Text style={styles.helperAnswer}>Choice: {item.choice}</Text>
            {item.reason && (
              <Text style={styles.helperReason}>Why: {item.reason}</Text>
            )}
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeItem('wouldYouRatherAnswers', index)}
            >
              <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Two Truths and a Lie Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Two Truths and a Lie ({selectedHelpers.twoTruthsOneLie.length}/2)</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={openTwoTruthsModal}
            disabled={selectedHelpers.twoTruthsOneLie.length >= 2}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {selectedHelpers.twoTruthsOneLie.map((item, index) => (
          <View key={index} style={styles.helperItem}>
            {item.category && (
              <Text style={styles.helperCategory}>{item.category}</Text>
            )}
            <Text style={styles.truthStatement}>• {item.truth1}</Text>
            <Text style={styles.truthStatement}>• {item.truth2}</Text>
            <Text style={styles.lieStatement}>• {item.lie} (lie)</Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeItem('twoTruthsOneLie', index)}
            >
              <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff4458',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helperItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    position: 'relative',
  },
  helperQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4458',
    marginBottom: 8,
  },
  helperAnswer: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  helperReason: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  helperCategory: {
    fontSize: 12,
    color: '#ff4458',
    fontWeight: '600',
    marginBottom: 8,
  },
  truthStatement: {
    fontSize: 14,
    color: '#4ade80',
    marginBottom: 4,
  },
  lieStatement: {
    fontSize: 14,
    color: '#f87171',
    marginBottom: 4,
  },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginTop: 16,
  },
  questionsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  questionItem: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedQuestion: {
    backgroundColor: '#ff4458',
  },
  questionText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedQuestionText: {
    color: '#fff',
    fontWeight: '600',
  },
  answerInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  choiceButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  choiceButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedChoice: {
    backgroundColor: '#ff4458',
  },
  choiceText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  selectedChoiceText: {
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#666',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#ff4458',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConversationHelpersSetup;
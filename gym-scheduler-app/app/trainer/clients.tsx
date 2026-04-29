import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Slider,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTrainerManagement } from '../../src/hooks/useTrainerManagement';
import { useAuth } from '../../src/api/context/AuthContext';

export default function TrainerClientsScreen() {
  const { trainerId } = useLocalSearchParams();
  const { user } = useAuth();
  const parsedTrainerId = typeof trainerId === 'string' ? parseInt(trainerId, 10) : NaN;
  const id = Number.isFinite(parsedTrainerId) ? parsedTrainerId : (user?.id ?? 0);

  const {
    sessionNotes,
    workoutPlans,
    loading,
    fetchSessionNotes,
    fetchWorkoutPlans,
    addSessionNote,
    createWorkoutPlan,
  } = useTrainerManagement(id);

  const [activeTab, setActiveTab] = useState<'notes' | 'plans'>('notes');
  const [memberId, setMemberId] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [performance, setPerformance] = useState<number>(3);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planTitle, setPlanTitle] = useState<string>('');
  const [planContent, setPlanContent] = useState<string>('');
  const [planDifficulty, setPlanDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(
    'intermediate'
  );

  useEffect(() => {
    if (!id) {
      return;
    }

    fetchSessionNotes();
    fetchWorkoutPlans();
  }, [id, fetchSessionNotes, fetchWorkoutPlans]);

  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Không xác định được trainer hiện tại.</Text>
      </View>
    );
  }

  const handleAddNote = async () => {
    if (!memberId || !noteContent) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin');
      return;
    }

    try {
      await addSessionNote({
        booking_id: 1, // Should come from booking context
        member_id: parseInt(memberId),
        content: noteContent,
        performance,
      });
      Alert.alert('Thành công', 'Ghi chú đã được thêm');
      setNoteContent('');
      setMemberId('');
      setPerformance(3);
      setShowNoteModal(false);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const handleCreatePlan = async () => {
    if (!memberId || !planTitle || !planContent) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin');
      return;
    }

    try {
      await createWorkoutPlan({
        member_id: parseInt(memberId),
        title: planTitle,
        content: planContent,
        difficulty: planDifficulty,
      });
      Alert.alert('Thành công', 'Kế hoạch tập luyện đã được tạo');
      setPlanTitle('');
      setPlanContent('');
      setMemberId('');
      setShowPlanModal(false);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const renderNotesTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowNoteModal(true)}>
        <Text style={styles.addButtonText}>+ Thêm ghi chú</Text>
      </TouchableOpacity>

      {sessionNotes.length === 0 ? (
        <Text style={styles.emptyText}>Không có ghi chú nào</Text>
      ) : (
        sessionNotes.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Text style={styles.memberId}>Thành viên #{note.member_id}</Text>
              <View style={styles.performanceBadge}>
                <Text style={styles.performanceText}>⭐ {note.performance}/5</Text>
              </View>
            </View>
            <Text style={styles.noteContent} numberOfLines={3}>
              {note.content}
            </Text>
            {note.focus_areas && note.focus_areas.length > 0 && (
              <View style={styles.focusAreas}>
                {note.focus_areas.map((area, idx) => (
                  <View key={idx} style={styles.focusTag}>
                    <Text style={styles.focusTagText}>{area}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderPlansTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowPlanModal(true)}>
        <Text style={styles.addButtonText}>+ Tạo kế hoạch</Text>
      </TouchableOpacity>

      {workoutPlans.length === 0 ? (
        <Text style={styles.emptyText}>Không có kế hoạch nào</Text>
      ) : (
        workoutPlans.map((plan) => (
          <View key={plan.id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>{plan.title}</Text>
              <View
                style={[
                  styles.difficultyBadge,
                  plan.difficulty === 'beginner' && styles.difficultyBeginner,
                  plan.difficulty === 'intermediate' && styles.difficultyIntermediate,
                  plan.difficulty === 'advanced' && styles.difficultyAdvanced,
                ]}
              >
                <Text style={styles.difficultyText}>
                  {plan.difficulty === 'beginner' && 'Dễ'}
                  {plan.difficulty === 'intermediate' && 'Trung bình'}
                  {plan.difficulty === 'advanced' && 'Nâng cao'}
                </Text>
              </View>
            </View>
            <Text style={styles.planContent} numberOfLines={4}>
              {plan.content}
            </Text>
            {plan.duration && (
              <Text style={styles.planDuration}>Thời gian: {plan.duration} tuần</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
            Ghi chú
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'plans' && styles.tabActive]}
          onPress={() => setActiveTab('plans')}
        >
          <Text style={[styles.tabText, activeTab === 'plans' && styles.tabTextActive]}>
            Kế hoạch
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'notes' && renderNotesTab()}
      {activeTab === 'plans' && renderPlansTab()}

      {/* Note Modal */}
      <Modal visible={showNoteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm ghi chú buổi tập</Text>

            <TextInput
              style={styles.input}
              placeholder="ID thành viên"
              value={memberId}
              onChangeText={setMemberId}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.input, styles.textAreaInput]}
              placeholder="Ghi chú (tối thiểu 10 ký tự)"
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              numberOfLines={5}
            />

            <View style={styles.performanceSlider}>
              <Text style={styles.sliderLabel}>Hiệu suất: {performance}/5</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={performance}
                onValueChange={setPerformance}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowNoteModal(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleAddNote}>
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Plan Modal */}
      <Modal visible={showPlanModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo kế hoạch tập luyện</Text>

            <TextInput
              style={styles.input}
              placeholder="ID thành viên"
              value={memberId}
              onChangeText={setMemberId}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Tiêu đề kế hoạch"
              value={planTitle}
              onChangeText={setPlanTitle}
            />

            <TextInput
              style={[styles.input, styles.textAreaInput]}
              placeholder="Nội dung kế hoạch"
              value={planContent}
              onChangeText={setPlanContent}
              multiline
              numberOfLines={5}
            />

            <View style={styles.difficultySelector}>
              <Text style={styles.label}>Mức độ</Text>
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.difficultyOption,
                    planDifficulty === level && styles.difficultyOptionActive,
                  ]}
                  onPress={() => setPlanDifficulty(level)}
                >
                  <Text
                    style={[
                      styles.difficultyOptionText,
                      planDifficulty === level && styles.difficultyOptionTextActive,
                    ]}
                  >
                    {level === 'beginner' && 'Dễ'}
                    {level === 'intermediate' && 'Trung bình'}
                    {level === 'advanced' && 'Nâng cao'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowPlanModal(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleCreatePlan}
              >
                <Text style={styles.buttonText}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  tabTextActive: {
    color: '#FF6B6B',
  },
  tabContent: {
    padding: 16,
  },
  addButton: {
    paddingVertical: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 32,
  },
  noteCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  performanceBadge: {
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  performanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  focusAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  focusTag: {
    backgroundColor: '#E6F7E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  focusTagText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#E6F7E6',
  },
  difficultyBeginner: {
    backgroundColor: '#E6F7E6',
  },
  difficultyIntermediate: {
    backgroundColor: '#FFF9E6',
  },
  difficultyAdvanced: {
    backgroundColor: '#FFE6E6',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  planContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  planDuration: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  performanceSlider: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  difficultySelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  difficultyOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 8,
  },
  difficultyOptionActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  difficultyOptionText: {
    fontSize: 14,
    color: '#666',
  },
  difficultyOptionTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

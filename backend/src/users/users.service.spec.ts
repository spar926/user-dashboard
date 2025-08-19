import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Mock the firebase import
jest.mock('../firebase', () => {
  const mockDoc = {
    id: 'mock-user-id-123',
    set: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };

  const mockWhereQuery = {
    get: jest.fn()
  };

  const mockCollection = {
    where: jest.fn(() => mockWhereQuery),
    doc: jest.fn((id?: string) => ({
      ...mockDoc,
      id: id || 'mock-user-id-123'
    })),
    get: jest.fn()
  };

  return {
    db: {
      collection: jest.fn(() => mockCollection)
    }
  };
});

// Get references to mocked functions
const { db: mockDb } = require('../firebase');

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully when email is unique', (done) => {
      // ARRANGE - Set up test data and mocks
      const userData: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user'
      };
      
      // Get the collection mock
      const mockCollection = mockDb.collection();
      const mockWhereQuery = mockCollection.where();
      const mockDocRef = mockCollection.doc();
      
      // Mock database to return empty result (no existing user)
      mockWhereQuery.get.mockResolvedValue({ empty: true });
      mockDocRef.set.mockResolvedValue(undefined);

      // ACT - Call the method we're testing
      service.create(userData).subscribe(
        (result) => {
          // ASSERT - Check if the result is what we expected
          expect(result).toEqual({
            id: 'mock-user-id-123',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user'
          });
          
          // Verify database methods were called correctly
          expect(mockDb.collection).toHaveBeenCalledWith('users');
          expect(mockCollection.where).toHaveBeenCalledWith('email', '==', 'john@example.com');
          expect(mockDocRef.set).toHaveBeenCalledWith({
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user'
          });
          
          done();
        },
        (error) => {
          done(error);
        }
      );
    });
  });
});
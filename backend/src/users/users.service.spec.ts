import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// mock the firebase import
jest.mock('../firebase', () => {
  const mockDoc = {
    id: 'mock-user',
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
      id: id || 'mock-user'
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
    it('should create a user successfully', (done) => {
      const userData: CreateUserDto = {
        name: 'Ally Park',
        email: 'ally@example.com',
        role: 'user'
      };
      
      // get the collection mock
      const mockCollection = mockDb.collection();
      const mockWhereQuery = mockCollection.where();
      const mockDocRef = mockCollection.doc();

      // call the method we're testing
      service.create(userData).subscribe(
        (result) => {
          expect(result).toEqual({
            id: 'mock-user',
            name: 'Ally Park',
            email: 'ally@example.com',
            role: 'user'
          });
          
          // verify database methods were called correctly
          expect(mockDb.collection).toHaveBeenCalledWith('users');
          expect(mockCollection.where).toHaveBeenCalledWith('email', '==', 'ally@example.com');
          expect(mockDocRef.set).toHaveBeenCalledWith({
            name: 'Ally Park',
            email: 'ally@example.com',
            role: 'user'
          });
          
          done();
        },
        (error) => {
          done(error);
        }
      )
    });
  });
});
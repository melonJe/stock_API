import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IPaginatedResponse } from '@common/interfaces';
import { DataSource } from 'typeorm';
import { Admin } from '@common/entities';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import { ERROR_CODE } from '@common/enums';
import { IAdmin } from '@common/interfaces';
import { CreateAdminDto, UpdateAdminDto } from './dtos';
import { isNil, omitBy } from 'lodash';
import { HashUtil } from '@common/utils';

@Injectable()
export class AdminService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  /**
   * 관리자추가
   * @param {CreateAdminDto} data 사용자 생성 정보
   * @returns {IAdmin}
   */
  async createAdmin(data: CreateAdminDto): Promise<IAdmin> {
    const { id, ...body } = data;
    if (await this.existsAdmin(id))
      throw new HttpException(
        {
          statusCode: ERROR_CODE.ALREADY_REGISTERED,
          message: 'Admin already exists',
        },
        HttpStatus.CONFLICT,
      );

    try {
      return await this.dataSource
        .getRepository(Admin)
        .create({
          id,
          ...body,
          createdAt: moment().toDate(),
        })
        .save();
    } catch (err) {
      throw new HttpException(
        {
          statusCode: ERROR_CODE.FAILED_INSERT_USER_INFO,
          message: 'Failed to create Admin Info',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 관리자수정
   * @param {String} id 사용자 ID
   * @param {UpdateAdminDto} data 사용자 수정 정보
   * @returns {IAdmin}
   */
  async updateAdmin(id: string, data: UpdateAdminDto): Promise<boolean> {
    if (!(await this.existsAdmin(id)))
      throw new HttpException(
        {
          statusCode: ERROR_CODE.NOT_FOUND_USER,
          message: 'Admin not found',
        },
        HttpStatus.NOT_FOUND,
      );

    const body: Partial<Admin> = { name: data.name };

    if (data.password) {
      body.salt = HashUtil.generateSalt();
      body.password = HashUtil.hash(data.password, body.salt);
    }

    try {
      await this.dataSource
        .getRepository(Admin)
        .update(id, omitBy(body, isNil));
      // return (
      //   (await this.dataSource.getRepository(Admin).update(id, { name: 'asd' }))
      //     .affected > 0
      // );
      return true;
    } catch (err) {
      throw new HttpException(
        {
          statusCode: ERROR_CODE.FAILED_INSERT_USER_INFO,
          message: 'Failed to create Admin Info',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 사용자 목록 불러오기 (페이징)
   * @param {number} page 페이지 번호 (1이상)
   * @param {number} limit 페이지 사이즈 (1이상)
   * @returns {IPaginatedResponse<IAdmin>} 사용자 목록
   */
  async findAllAdmin(
    page?: number,
    limit?: number,
  ): Promise<IPaginatedResponse<IAdmin>> {
    if (page == undefined) page = 1;
    else if (page < 2) page = 1;

    if (limit == undefined) limit = 100;
    else if (limit < 1) limit = 1;

    const total = await this.dataSource.getRepository(Admin).count();
    const results = await this.dataSource.getRepository(Admin).find({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      pageInfo: {
        total: total,
        page,
        limit,
      },
      items: results,
    };
  }

  /**
   * 해당 ID 사용자 가져오기
   * @param {string} id 사용자ID
   * @returns {IAdmin} 사용자
   */
  async findOneAdmin(id: string): Promise<IAdmin> {
    try {
      return this.findOneAdminOrFail(id);
    } catch (err) {
      throw new HttpException(
        {
          statusCode: ERROR_CODE.NOT_FOUND_USER,
          message: 'Admin not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * 해당 ID 사용자 가져오기 (exception)
   * @param {string} id 사용자ID
   * @returns {IAdmin} 사용자
   */
  async findOneAdminOrFail(id: string): Promise<Admin> {
    if (!id)
      throw new HttpException(
        {
          statusCode: ERROR_CODE.MISSING_PARAMETERS,
          message: 'Missing Parameters',
          params: ['id'],
        },
        HttpStatus.BAD_REQUEST,
      );
    return this.dataSource.getRepository(Admin).findOneByOrFail({
      id,
    });
  }

  /**
   * 해당 ID 사용자 존재유무
   * @param {string} id 사용자ID
   * @returns {boolean} 존재유무
   */
  async existsAdmin(id: string): Promise<boolean> {
    if (!id)
      throw new HttpException(
        {
          statusCode: ERROR_CODE.MISSING_PARAMETERS,
          message: 'Missing Parameters',
          params: ['id'],
        },
        HttpStatus.BAD_REQUEST,
      );
    return (
      (await this.dataSource.getRepository(Admin).countBy({
        id,
      })) > 0
    );
  }
}
